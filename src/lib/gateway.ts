/**
 * Gateway Client — Central fetch wrapper for Black Box Nexus
 * 
 * Data/SEO/Domain calls route through the comms-gateway Cloudflare Worker.
 * AI calls route through local Next.js API routes (/api/ai/*) in dev,
 * and through the comms-gateway worker (/comms/ai) in production.
 */

import { supabase } from '@/lib/supabase/client';

const GATEWAY_URL = 'https://booths-comms-gateway.ali-373.workers.dev';

/** Detect local dev vs production (CF Pages static export strips /api/) */
const isLocalDev = () =>
    typeof window !== 'undefined' && (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1');

/**
 * AI-specific POST — routes to local /api/ai/* in dev, worker in production.
 * In production the worker's /comms/ai endpoint handles Gemini calls.
 */
export async function aiPost(localPath: string, body: Record<string, any>): Promise<any> {
    if (isLocalDev()) {
        const res = await fetch(localPath, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(body),
        });
        if (!res.ok) throw new Error(`AI error: ${res.status}`);
        return res.json();
    }
    // Production: route through gateway worker
    const res = await fetch(`${GATEWAY_URL}/comms/ai`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            prompt: body.prompt,
            systemInstruction: body.personaContext || body.systemInstruction,
            jsonMode: body.jsonMode,
            history: body.history,
        }),
    });
    if (!res.ok) throw new Error(`AI gateway error: ${res.status}`);
    return res.json();
}

/**
 * Generic POST to the comms-gateway worker
 */
export async function gatewayPost<T = any>(endpoint: string, body: Record<string, any> = {}): Promise<T> {
    const headers: Record<string, string> = { 'Content-Type': 'application/json' };
    
    try {
        // Only attempt to get session if we're in the browser to avoid server-side SSR issues without cookies
        if (typeof window !== 'undefined' && supabase) {
            const { data } = await supabase.auth.getSession();
            if (data?.session?.access_token) {
                headers['Authorization'] = `Bearer ${data.session.access_token}`;
            }
        }
    } catch (e) {
        console.warn('Could not inject auth token:', e);
    }

    const res = await fetch(`${GATEWAY_URL}${endpoint}`, {
        method: 'POST',
        headers,
        body: JSON.stringify(body),
    });
    if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.error || err.message || `Gateway error: ${res.status}`);
    }
    return res.json();
}

// ── SEO Tools ────────────────────────────────────────────────

/** Helper to unpack proxy responses */
const proxyPost = (tool: string, payload: any) =>
    gatewayPost('/seo/proxy', { tool, ...payload }).then((r: any) => {
        if (!r.success && r.error) throw new Error(r.error);
        return r.data || r;
    });

/** PageSpeed Insights via gateway */
export const seoPageSpeed = (url: string) => proxyPost('pagespeed', { url });

/** HTTP headers check via gateway */
export const seoHeaders = (url: string) => proxyPost('headers', { url });

/** Page scrape (title, meta, h1, links) via gateway */
export const seoScrape = (url: string) => proxyPost('scrape', { url });

/** NLP analysis via Gemini (local proxy) */
export const seoNLP = async (text: string, analysisType: string = 'entities') => {
    const res = await fetch('/api/ai/proxy', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            prompt: `Analyze this text for ${analysisType}. Return structured JSON. Text: "${text.substring(0, 2000)}"`,
            jsonMode: true,
        }),
    });
    if (!res.ok) throw new Error(`NLP error: ${res.status}`);
    const data = await res.json();
    try { return JSON.parse(data.response); } catch { return data; }
};

/** newly added route proxy exports */
export const seoCrawl = (url: string) => proxyPost('crawl', { url });
export const seoWayback = (url: string) => proxyPost('wayback', { url });
export const seoTechstack = (url: string) => proxyPost('techstack', { url });
export const seoSerp = (query: string) => proxyPost('serp', { query });
export const seoPAA = (query: string) => proxyPost('paa', { query });
export const seoDomainLookup = (domain: string) => proxyPost('domain-lookup', { domain });

/** Keyword research via Gemini (local proxy) */
export const seoKeywordResearch = async (seed: string, location?: string) => {
    const prompt = `Act as an SEO expert. Given the seed keyword "${seed}"${location ? ` targeting location: ${location}` : ''}, perform deep keyword expansion using question mining, A-Z expansion, and LSI terms. 
        Return ONLY valid JSON exactly matching this structure:
        {
          "seed": "${seed}",
          "location": "${location || null}",
          "total": number,
          "longTailCount": number,
          "keywords": [
            {
              "keyword": string,
              "wordCount": number,
              "isLongTail": boolean,
              "hasLocation": boolean,
              "volumeEstimate": string (e.g. "1K - 10K"),
              "volumeScore": number (0-100),
              "competition": "LOW" | "MEDIUM" | "HIGH",
              "intent": "transactional" | "commercial" | "navigational" | "informational",
              "source": "Suggestions" | "A-Z" | "Questions" | "LSI"
            }
          ]
        }
        Generate at least 25 highly relevant keyword variations.`;
    try {
        const res = await fetch('/api/ai/proxy', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ prompt, jsonMode: true }),
        });
        if (!res.ok) throw new Error(`Keyword research error: ${res.status}`);
        const data = await res.json();
        const parsed = JSON.parse(data.response?.replace(/```json\n?|```/g, '') || '{}');
        return parsed;
    } catch {
        return { seed, location, total: 0, longTailCount: 0, keywords: [] };
    }
};

// ── SEO Assets (Supabase CRUD) ───────────────────────────────

export const seoAssets = {
    list: () => gatewayPost('/db/proxy', { table: 'seo_assets', method: 'GET', query: 'select=*&order=created_at.desc&limit=200' }),
    create: (payload: any) => gatewayPost('/db/proxy', { table: 'seo_assets', method: 'POST', payload }),
    update: (id: string, payload: any) => gatewayPost('/db/proxy', { table: 'seo_assets', method: 'PATCH', id, payload }),
    delete: (id: string) => gatewayPost('/db/proxy', { table: 'seo_assets', method: 'DELETE', id }),
};

// ── SEO Outreach (Supabase CRUD) ─────────────────────────────

export const seoOutreach = {
    list: () => gatewayPost('/db/proxy', { table: 'seo_outreach', method: 'GET', query: 'select=*&order=created_at.desc' }),
    create: (payload: any) => gatewayPost('/db/proxy', { table: 'seo_outreach', method: 'POST', payload }),
    update: (id: string, payload: any) => gatewayPost('/db/proxy', { table: 'seo_outreach', method: 'PATCH', id, payload }),
};

// ── pSEO (Supabase + AI) ────────────────────────────────────

export const pseo = {
    locations: () => gatewayPost('/db/proxy', { table: 'pseo_locations', method: 'GET' }),
    generate: async (payload: any) => {
        return aiPost('/api/ai/proxy', {
            prompt: `Generate programmatic SEO content for: ${JSON.stringify(payload)}. Return JSON with: { title, meta_description, h1, body_html, schema_json }`,
            jsonMode: true,
        });
    },
    prelaunch: (domain: string) => gatewayPost('/pseo/prelaunch', { domain }),
    renderPage: (slug: string) => gatewayPost('/pseo/render-page', { slug }),
};

// ── Review Link / Content Forge ──────────────────────────────

export const reviewLink = {
    generate: async (payload: any) => {
        return aiPost('/api/ai/chat', {
            prompt: `Generate a Google review link and QR code instructions for the business: ${JSON.stringify(payload)}. Return JSON with: { reviewUrl, qrInstructions, shortLink }`,
        });
    },
    list: () => gatewayPost('/db/proxy', { table: 'review_links', method: 'GET' }),
    create: (payload: any) => gatewayPost('/db/proxy', { table: 'review_links', method: 'POST', payload }),
    get: (id: string) => gatewayPost('/db/proxy', { table: 'review_links', method: 'GET', query: `id=eq.${id}&limit=1` }).then((r: any) => Array.isArray(r.data) ? r.data[0] : null),
    
    analyzeFeedback: async (payload: { businessName: string, feedback: string }) => {
        return aiPost('/api/ai/review', {
            prompt: `Analyze this customer feedback for the business "${payload.businessName}": "${payload.feedback}". Return JSON: { sentiment: "positive"|"neutral"|"negative", expandedReview: "if positive, a warm 2-3 sentence Google review" }`,
            ...payload,
            jsonMode: true,
        });
    },
    
    submitPrivateFeedback: (payload: any) => gatewayPost('/db/proxy', { table: 'review_feedback', method: 'POST', payload }),
};

// ── AI Chat (NexusAI) ────────────────────────────────────────

export const aiChat = async (messages: Array<{ role: string; content: string }>, personaContext?: string) => {
    const prompt = messages[messages.length - 1]?.content || '';
    const history = messages.length > 1 ? messages.slice(0, -1) : undefined;
    return aiPost('/api/ai/chat', { prompt, personaContext, history });
};

// ── Website Builder AI ───────────────────────────────────────

export const websiteAI = {
    generateSitePlan: async (domain: string, niche: string) => {
        return aiPost('/api/ai/proxy', {
            prompt: `Design a website plan for ${domain} in the ${niche} niche. Return JSON with: { pages: [{ slug, title, description, sections }], siteStructure, colorScheme, typography }`,
            jsonMode: true,
        });
    },
    generateBlog: async (topic: string, keywords: string[]) => {
        return aiPost('/api/ai/proxy', {
            prompt: `Write an SEO-optimized blog post about "${topic}" targeting keywords: ${keywords.join(', ')}. Return JSON with: { title, meta_description, content_md, schema_json, word_count }`,
            jsonMode: true,
        });
    },
};

// ── Domains & Forwarding ─────────────────────────────────────

export const domainAPI = {
    categories: () => gatewayPost('/db/proxy', { table: 'domain_categories', method: 'GET' }),
    updateCategory: (domain: string, category: string) => gatewayPost('/db/proxy', { table: 'domain_categories', method: 'PATCH', id: domain, payload: { category } }),
    update: (domain: string, payload: any) => gatewayPost('/domains/update', { domain, ...payload }),
    setDNS: (domain: string, payload: any) => gatewayPost('/domains/dns', { domain, ...payload }),
    deleteDNS: (domain: string, id: string) => gatewayPost('/domains/dns', { domain, id, method: 'DELETE' }),
    getDNS: (domain: string) => gatewayPost('/domains/dns', { domain, method: 'GET' }),
};

export const domainForwarding = {
    getUrlForwarding: (domain: string) => gatewayPost('/domains/forwarding/url', { domain, method: 'GET' }),
    setUrlForwarding: (domain: string, payload: any) => gatewayPost('/domains/forwarding/url', { domain, method: 'POST', ...payload }),
    deleteUrlForwarding: (domain: string, id: string) => gatewayPost('/domains/forwarding/url', { domain, method: 'DELETE', id }),
    
    getEmailForwarding: (domain: string) => gatewayPost('/domains/forwarding/email', { domain, method: 'GET' }),
    setEmailForwarding: (domain: string, payload: any) => gatewayPost('/domains/forwarding/email', { domain, method: 'POST', ...payload }),
    deleteEmailForwarding: (domain: string, email: string) => gatewayPost('/domains/forwarding/email', { domain, method: 'DELETE', email }),
};

// ── Uplinks (Registrar Credentials) ──────────────────────────

export const uplinkAPI = {
    list: () => gatewayPost('/uplinks/list'),
    add: (payload: any) => gatewayPost('/uplinks/add', payload),
    delete: (id: string) => gatewayPost('/uplinks/delete', { id }),
};

// ── Git & Deployment ─────────────────────────────────────────

export const gitAPI = {
    status: () => gatewayPost('/git/status'),
    deploy: (payload: any = {}) => gatewayPost('/git/deploy', payload),
};

// ── Traffic Arsenal ──────────────────────────────────────────

export const trafficAPI = {
    getCampaigns: () => gatewayPost('/traffic/campaigns'),
};
