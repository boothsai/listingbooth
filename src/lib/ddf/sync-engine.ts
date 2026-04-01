/**
 * DDF Sync Engine — Orchestrates the full sync pipeline
 * 
 * Flow:
 *   1. Read last sync timestamp from sync_meta
 *   2. Delta-fetch from RESO API (all listings modified since last sync)
 *   3. Map RESO → ListingBooth schema
 *   4. Upsert into res_ddf.properties (conflict on mls_number)
 *   5. Update sync_meta with new timestamp
 *   6. Return stats
 * 
 * Designed to run as:
 *   - Cloudflare Worker cron (every 15 min)
 *   - Manual trigger via POST /api/ddf/sync
 */

import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { ResoClient, type ResoConfig } from './reso-client';
import { mapBatch, type ListingRow } from './mapper';

export interface SyncConfig {
  reso: ResoConfig;
  supabaseUrl: string;
  supabaseServiceKey: string;
  boards: string[]; // e.g., ['OREB', 'TRREB']
  batchSize?: number;
  maxListings?: number;
}

export interface SyncResult {
  success: boolean;
  inserted: number;
  updated: number;
  errors: number;
  duration_ms: number;
  last_timestamp: string;
  boards: string[];
}

export class DdfSyncEngine {
  private reso: ResoClient;
  private db: SupabaseClient;
  private config: SyncConfig;

  constructor(config: SyncConfig) {
    this.config = config;
    this.reso = new ResoClient(config.reso);
    this.db = createClient(config.supabaseUrl, config.supabaseServiceKey, {
      auth: { persistSession: false },
    });
  }

  /**
   * Get the last sync timestamp from the sync_meta table
   */
  private async getLastSync(): Promise<string> {
    const { data } = await this.db
      .from('ddf_sync_meta')
      .select('last_sync_at')
      .eq('feed_name', 'crea_ddf')
      .single();

    if (data?.last_sync_at) return data.last_sync_at;

    // If no sync meta exists, default to 30 days ago for initial sync
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    return thirtyDaysAgo.toISOString();
  }

  /**
   * Update the last sync timestamp
   */
  private async setLastSync(timestamp: string): Promise<void> {
    await this.db
      .from('ddf_sync_meta')
      .upsert({
        feed_name: 'crea_ddf',
        last_sync_at: timestamp,
        updated_at: new Date().toISOString(),
      }, { onConflict: 'feed_name' });
  }

  /**
   * Upsert a batch of listings into Supabase
   * Returns { inserted, updated, errors }
   */
  private async upsertBatch(rows: ListingRow[]): Promise<{ inserted: number; updated: number; errors: number }> {
    if (rows.length === 0) return { inserted: 0, updated: 0, errors: 0 };

    const { data, error } = await this.db
      .from('listings')
      .upsert(rows, {
        onConflict: 'mls_number',
        ignoreDuplicates: false,
      })
      .select('id');

    if (error) {
      console.error(`[DDF-SYNC] Batch upsert failed:`, error.message);
      return { inserted: 0, updated: 0, errors: rows.length };
    }

    // We don't easily distinguish inserts vs updates with upsert
    // Count all as "updated" and rely on total count diff for inserts
    return { inserted: 0, updated: data?.length ?? 0, errors: 0 };
  }

  /**
   * Run the full sync pipeline
   */
  async sync(): Promise<SyncResult> {
    const startTime = Date.now();
    const stats = { inserted: 0, updated: 0, errors: 0 };

    console.log(`[DDF-SYNC] Starting sync for boards: ${this.config.boards.join(', ')}`);

    // 1. Get last sync timestamp
    const lastSync = await this.getLastSync();
    console.log(`[DDF-SYNC] Last sync: ${lastSync}`);

    // 2. Count existing listings (to calculate inserts later)
    const { count: beforeCount } = await this.db
      .from('listings')
      .select('*', { count: 'exact', head: true });

    // 3. Delta fetch from RESO API
    let latestTimestamp = lastSync;
    let totalFetched = 0;
    const batchSize = this.config.batchSize ?? 200;
    const maxListings = this.config.maxListings ?? 50000;

    try {
      for await (const batch of this.reso.deltaSync(lastSync, {
        pageSize: batchSize,
        boards: this.config.boards,
      })) {
        // 4. Map RESO → ListingBooth
        const rows = mapBatch(batch);

        // 5. Upsert batch
        const result = await this.upsertBatch(rows);
        stats.updated += result.updated;
        stats.errors += result.errors;

        // Track latest timestamp
        for (const prop of batch) {
          if (prop.ModificationTimestamp > latestTimestamp) {
            latestTimestamp = prop.ModificationTimestamp;
          }
        }

        totalFetched += batch.length;
        console.log(`[DDF-SYNC] Processed ${totalFetched} listings...`);

        // Safety cap
        if (totalFetched >= maxListings) {
          console.log(`[DDF-SYNC] Reached max listings cap (${maxListings}), stopping`);
          break;
        }

        // Rate limiting: 100ms between batches to avoid hammering DDF
        await new Promise(r => setTimeout(r, 100));
      }
    } catch (err) {
      console.error(`[DDF-SYNC] RESO API error:`, err instanceof Error ? err.message : err);
      stats.errors++;
    }

    // 6. Calculate inserts vs updates
    const { count: afterCount } = await this.db
      .from('listings')
      .select('*', { count: 'exact', head: true });

    const netNew = (afterCount ?? 0) - (beforeCount ?? 0);
    stats.inserted = Math.max(0, netNew);
    stats.updated = Math.max(0, stats.updated - stats.inserted);

    // 7. Update sync timestamp
    if (latestTimestamp > lastSync) {
      await this.setLastSync(latestTimestamp);
    }

    const duration = Date.now() - startTime;
    console.log(`[DDF-SYNC] Complete: ${stats.inserted} inserted, ${stats.updated} updated, ${stats.errors} errors in ${duration}ms`);

    return {
      success: stats.errors === 0,
      ...stats,
      duration_ms: duration,
      last_timestamp: latestTimestamp,
      boards: this.config.boards,
    };
  }
}
