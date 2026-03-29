import fetch from 'node-fetch';
import https from 'https';
import fs from 'fs';

process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';

async function probeBBH() {
    console.log("Probing BuzzBuzzHome Ottawa...");
    const url = 'https://www.buzzbuzzhome.com/ca/on/ottawa';
    
    // Ignore SSL certificate expiration
    const agent = new https.Agent({ rejectUnauthorized: false });

    try {
        const res = await fetch(url, {
            agent,
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
                'Accept': 'text/html'
            }
        });

        if (!res.ok) {
            console.error("BBH Blocked:", res.status);
            return;
        }

        const html = await res.text();
        console.log(`✅ Extracted HTML length: ${html.length}`);

        // Scrape Initial State for hydrated data
        const jsonMatch = html.match(/window\.__INITIAL_STATE__\s*=\s*(\{[\s\S]+?\});/);
        if (jsonMatch) {
           const blob = jsonMatch[1];
           console.log("🔥 Found __INITIAL_STATE__ JSON blob. Length:", blob.length);
           fs.writeFileSync('c:\\ANTIGRAVITY\\LISTINGBOOTH\\bbh_state.json', blob);
           console.log("Saved raw payload to bbh_state.json");
           
           // parse it
           const data = JSON.parse(blob);
           const listings = Object.values(data.entities?.projects || {});
           console.log(`Extracted ${listings.length} raw projects!`);
        } else {
           console.log("No __INITIAL_STATE__ blob found. They might be rendering server-side.");
           const nameMatches = Array.from(html.matchAll(/<h[23][^>]*>([^<]{5,60})<\/h[23]>/gi));
           console.log(`Found ${nameMatches.length} potential project titles via HTML.`);
           fs.writeFileSync('c:\\ANTIGRAVITY\\LISTINGBOOTH\\bbh_raw.html', html);
        }
    } catch (e) {
        console.error("Fetch Error:", e.message);
    }
}

probeBBH();
