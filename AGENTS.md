<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

<!-- BEGIN:booths-vault-mandate -->
## 🔐 MANDATORY: Credential Access Rules

**Before ANY Supabase, API, or database operation, you MUST read the secure Vault:**
`C:\ANTIGRAVITY\VAULT\_CREDENTIALS.md`

This file contains ALL API tokens for the entire BOOTHS.AI ecosystem. **Never use mock keys. Never generate new credentials. Never ask the user for keys.**

### Quick Supabase Access (PowerShell)
```powershell
$key = "SERVICE_ROLE_KEY_FROM_VAULT"
$h = @{ "apikey" = $key; "Authorization" = "Bearer $key" }
Invoke-RestMethod -Uri "https://qmsbvvnffaojddysvqmd.supabase.co/rest/v1/TABLE?select=*&limit=10" -Headers $h
```
<!-- END:booths-vault-mandate -->
