import fetch from 'node-fetch';
import fs from 'fs';

async function scrapeLivabl() {
  console.log("Fetching Livabl Toronto data...");
  const url = 'https://www.livabl.com/toronto-on';
  
  try {
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/114.0.0.0 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
        'Accept-Language': 'en-US,en;q=0.5'
      }
    });
    
    const html = await response.text();
    console.log(`Received ${html.length} bytes of HTML.`);
    
    // Look for Next.js __NEXT_DATA__ block which usually contains the prefetched JSON data
    const match = html.match(/<script id="__NEXT_DATA__" type="application\/json">([\s\S]*?)<\/script>/);
    if (match) {
      const jsonData = JSON.parse(match[1]);
      fs.writeFileSync('./livabl_data.json', JSON.stringify(jsonData, null, 2));
      console.log("Saved __NEXT_DATA__ to livabl_data.json");
      
      // Try to extract some useful insight from it
      const props = jsonData.props?.pageProps;
      if (props) {
        console.log("Keys in pageProps:", Object.keys(props));
        // We might find apolloState or something similar for GraphQL
        if (props.initialApolloState) {
           console.log("Found Apollo State!");
           const stateKeys = Object.keys(props.initialApolloState).filter(k => k.includes('Project'));
           console.log(`Found ${stateKeys.length} Project entities.`);
        }
      }
    } else {
      console.log("No __NEXT_DATA__ script tag found.");
      // Check if they use an alternate structure
      fs.writeFileSync('./livabl_raw.html', html);
      console.log("Saved raw HTML to livabl_raw.html");
    }
  } catch (err) {
    console.error("Error fetching Livabl:", err);
  }
}

scrapeLivabl();
