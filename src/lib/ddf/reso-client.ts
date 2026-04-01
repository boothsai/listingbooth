/**
 * RESO Web API Client — CREA DDF Data Distribution Facility
 * 
 * Implements the RESO (Real Estate Standards Organization) Web API v1.0
 * for pulling listings from OREB (Ottawa) and TRREB (GTA) feeds.
 * 
 * Supports:
 *   - OAuth2 Bearer Token authentication
 *   - OData $filter, $select, $top, $skip, $orderby
 *   - Delta sync via ModificationTimestamp
 *   - Auto-pagination through @odata.nextLink
 * 
 * Reference: https://www.reso.org/reso-web-api/
 */

export interface ResoConfig {
  /** RESO Web API base URL (e.g., https://data.crea.ca/Feed.svc) */
  apiUrl: string;
  /** OAuth2 Bearer Token */
  bearerToken: string;
  /** Board identifier for filtering (e.g., 'OREB', 'TRREB') */
  board?: string;
}

export interface ResoProperty {
  // Standard RESO Property fields
  ListingKey: string;
  ListingId?: string;
  MlsStatus: string;
  StandardStatus: string;
  PropertyType: string;
  PropertySubType?: string;
  ListPrice: number;
  ClosePrice?: number;
  OriginalListPrice?: number;

  // Address
  StreetNumber?: string;
  StreetName?: string;
  StreetSuffix?: string;
  UnitNumber?: string;
  City: string;
  StateOrProvince: string;
  PostalCode: string;
  Country?: string;
  Latitude?: number;
  Longitude?: number;
  SubdivisionName?: string;

  // Property Details
  BedroomsTotal?: number;
  BathroomsTotalInteger?: number;
  LivingArea?: number;
  LotSizeArea?: number;
  LotSizeUnits?: string;
  YearBuilt?: number;
  BuildingAreaTotal?: number;
  Stories?: number;
  GarageSpaces?: number;

  // Dates
  ListDate?: string;
  CloseDate?: string;
  OnMarketDate?: string;
  ModificationTimestamp: string;
  OriginalEntryTimestamp?: string;
  DaysOnMarket?: number;

  // Descriptions
  PublicRemarks?: string;
  PrivateRemarks?: string; // Agent-only — never expose

  // Agent / Office
  ListAgentFullName?: string;
  ListAgentEmail?: string;
  ListOfficeName?: string;
  ListOfficeMlsId?: string;

  // Media
  Media?: ResoMedia[];

  // Catch-all for board-specific fields
  [key: string]: unknown;
}

export interface ResoMedia {
  MediaURL: string;
  MediaCategory: string;
  Order: number;
  ShortDescription?: string;
}

export interface ResoPage {
  '@odata.context'?: string;
  '@odata.nextLink'?: string;
  '@odata.count'?: number;
  value: ResoProperty[];
}

/**
 * RESO Web API Client
 */
export class ResoClient {
  private config: ResoConfig;

  constructor(config: ResoConfig) {
    this.config = config;
  }

  /**
   * Fetch a page of Property resources
   */
  async getProperties(params: {
    filter?: string;
    select?: string;
    top?: number;
    skip?: number;
    orderby?: string;
    expand?: string;
  }): Promise<ResoPage> {
    const url = new URL(`${this.config.apiUrl}/Property`);

    if (params.filter) url.searchParams.set('$filter', params.filter);
    if (params.select) url.searchParams.set('$select', params.select);
    if (params.top) url.searchParams.set('$top', String(params.top));
    if (params.skip) url.searchParams.set('$skip', String(params.skip));
    if (params.orderby) url.searchParams.set('$orderby', params.orderby);
    if (params.expand) url.searchParams.set('$expand', params.expand);

    // Request inline count
    url.searchParams.set('$count', 'true');

    const res = await fetch(url.toString(), {
      headers: {
        Authorization: `Bearer ${this.config.bearerToken}`,
        Accept: 'application/json',
      },
    });

    if (!res.ok) {
      const body = await res.text().catch(() => '');
      throw new Error(`RESO API error ${res.status}: ${body.slice(0, 500)}`);
    }

    return res.json() as Promise<ResoPage>;
  }

  /**
   * Fetch a single Property by ListingKey
   */
  async getProperty(listingKey: string): Promise<ResoProperty | null> {
    const res = await fetch(`${this.config.apiUrl}/Property('${listingKey}')`, {
      headers: {
        Authorization: `Bearer ${this.config.bearerToken}`,
        Accept: 'application/json',
      },
    });

    if (res.status === 404) return null;
    if (!res.ok) throw new Error(`RESO API error ${res.status}`);

    return res.json() as Promise<ResoProperty>;
  }

  /**
   * Delta sync: fetch all listings modified since a given timestamp
   * Auto-paginates through @odata.nextLink
   */
  async *deltaSync(
    since: string,
    options: {
      pageSize?: number;
      maxPages?: number;
      boards?: string[];
    } = {}
  ): AsyncGenerator<ResoProperty[], void, unknown> {
    const pageSize = options.pageSize ?? 200;
    const maxPages = options.maxPages ?? 500;

    // Build OData filter
    const filters: string[] = [
      `ModificationTimestamp gt ${since}`,
    ];

    // If board filtering is needed (DDF supports OriginatingSystemName)
    if (options.boards && options.boards.length > 0) {
      const boardFilter = options.boards
        .map(b => `OriginatingSystemName eq '${b}'`)
        .join(' or ');
      filters.push(`(${boardFilter})`);
    }

    let nextUrl: string | null = null;
    let page = 0;

    while (page < maxPages) {
      let result: ResoPage;

      if (nextUrl) {
        // Follow @odata.nextLink
        const res = await fetch(nextUrl, {
          headers: {
            Authorization: `Bearer ${this.config.bearerToken}`,
            Accept: 'application/json',
          },
        });
        if (!res.ok) throw new Error(`RESO pagination error ${res.status}`);
        result = await res.json() as ResoPage;
      } else {
        result = await this.getProperties({
          filter: filters.join(' and '),
          top: pageSize,
          orderby: 'ModificationTimestamp asc',
          expand: 'Media',
        });
      }

      if (result.value.length === 0) break;

      yield result.value;

      nextUrl = result['@odata.nextLink'] ?? null;
      if (!nextUrl) break;

      page++;
    }
  }
}
