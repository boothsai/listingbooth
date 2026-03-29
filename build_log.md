npx : ΓÜá `eslint` 
configuration in 
next.config.mjs is no 
longer supported. See more 
info here: https://nextjs.o
rg/docs/app/api-reference/c
li/next#next-lint-options
At line:1 char:1
+ npx next build 2>&1 | 
Out-File -FilePath c:\ANTIG
RAVITY\LISTINGBOOTH\ ...
+ ~~~~~~~~~~~~~~~~~~~
    + CategoryInfo         
     : NotSpecified: (ΓÜá  
   `eslint` co...xt-lint   
 -options:String) [], R    
emoteException
    + FullyQualifiedErrorI 
   d : NativeCommandError
 
ΓÜá Invalid 
next.config.mjs options 
detected: 
ΓÜá     Unrecognized 
key(s) in object: 'eslint'
ΓÜá See more info here: htt
ps://nextjs.org/docs/messag
es/invalid-next-config
ΓÜá Warning: Next.js 
inferred your workspace 
root, but it may not be 
correct.
 We detected multiple 
lockfiles and selected the 
directory of C:\ANTIGRAVITY
\package-lock.json as the 
root directory.
 To silence this warning, 
set `turbopack.root` in 
your Next.js config, or 
consider removing one of 
the lockfiles if it's not 
needed.
   See https://nextjs.org/d
ocs/app/api-reference/confi
g/next-config-js/turbopack#
root-directory for more 
information.
 Detected additional 
lockfiles: 
   * C:\ANTIGRAVITY\LISTING
BOOTH\package-lock.json

Γû▓ Next.js 16.2.1 (Turbopack)
- Environments: .env.local

ΓÜá The "middleware" file 
convention is deprecated. 
Please use "proxy" 
instead. Learn more: https:
//nextjs.org/docs/messages/
middleware-to-proxy
  Creating an optimized production build ...
Γ£ô Compiled successfully in 9.6s
  Skipping validation of types
  Finished TypeScript config validation in 16ms ...
  Collecting page data using 11 workers ...
ΓÜá Using edge runtime on 
a page currently disables 
static generation for that 
page
  Generating static pages using 11 workers (0/16) ...
  Generating static pages using 11 workers (4/16) 
  Generating static pages using 11 workers (8/16) 
  Generating static pages using 11 workers (12/16) 
Γ£ô Generating static pages using 11 workers (16/16) in 955ms
  Finalizing page optimization ...

Route (app)                             Revalidate  Expire
Γöî Γùï /
Γö£ Γùï /_not-found
Γö£ ╞Æ /[city]/[...slug]
Γö£ ╞Æ /admin
Γö£ ╞Æ /admin/analytics
Γö£ ╞Æ /agent
Γö£ ╞Æ /agent/billing
Γö£ ╞Æ /agent/intelligence
Γö£ ╞Æ /agent/login
Γö£ ╞Æ /agent/settings
Γö£ ╞Æ /agent/tours
Γö£ ╞Æ /api/admin/invite
Γö£ ╞Æ /api/agent/settings
Γö£ ╞Æ /api/chat
Γö£ ╞Æ /api/collections
Γö£ ╞Æ /api/deals/stage
Γö£ ╞Æ /api/email/drip
Γö£ ╞Æ /api/email/unsubscribe
Γö£ ╞Æ /api/email/welcome-drip
Γö£ ╞Æ /api/favorites
Γö£ ╞Æ /api/ghost-alert
Γö£ ╞Æ /api/lead/event
Γö£ ╞Æ /api/leads
Γö£ ╞Æ /api/leads/score
Γö£ ╞Æ /api/listings
Γö£ ╞Æ /api/listings/[id]
Γö£ ╞Æ /api/listings/bounds
Γö£ ╞Æ /api/listings/featured
Γö£ ╞Æ /api/market/stats
Γö£ ╞Æ /api/new-construction
Γö£ ╞Æ /api/recommendations/[listing_key]
Γö£ ╞Æ /api/saved-searches
Γö£ ╞Æ /api/share
Γö£ ╞Æ /api/stripe/checkout
Γö£ ╞Æ /api/stripe/webhook
Γö£ ╞Æ /auth/callback
Γö£ Γùï /buy
Γö£ ╞Æ /dashboard
Γö£ ╞Æ /dashboard/collections
Γö£ ╞Æ /dashboard/journey
Γö£ ╞Æ /dashboard/messages
Γö£ ╞Æ /dashboard/saved-searches
Γö£ ╞Æ /favorites
Γö£ ╞Æ /homes-for-sale/[...slug]
Γö£ Γùï /icon.png
Γö£ ╞Æ /legal/[slug]
Γö£ ╞Æ /listing/[id]
Γö£ Γùï /login
Γö£ Γùï /map-search
Γö£ Γùï /market-report
Γö£ Γùï /new-construction
Γö£ ╞Æ /new-construction/[slug]
Γö£ ╞Æ /ottawa/[...slug]
Γö£ Γùï /platform
Γö£ Γùï /robots.txt
Γö£ ╞Æ /search/vision
Γö£ Γùï /sell
Γö£ ╞Æ /share/[token]
Γö£ Γùï /sitemap.xml                                1h      1y
Γö£ Γùï /tools
Γö£ Γùï /tools/compare
Γöö ╞Æ /unsubscribe


╞Æ Proxy (Middleware)

Γùï  (Static)   prerendered as static content
╞Æ  (Dynamic)  server-rendered on demand

