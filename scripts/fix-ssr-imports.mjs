// Fix remaining createServerClient CALLS to createClient
import { readFileSync, writeFileSync, readdirSync, statSync } from 'fs';
import { join } from 'path';

function walk(dir) {
  const files = [];
  for (const f of readdirSync(dir)) {
    const p = join(dir, f);
    if (statSync(p).isDirectory()) files.push(...walk(p));
    else if (f.endsWith('.ts') || f.endsWith('.tsx')) files.push(p);
  }
  return files;
}

let fixed = 0;
for (const file of walk('src/app')) {
  let content = readFileSync(file, 'utf-8');
  
  if (!content.includes('createServerClient')) continue;
  
  // Replace the import if still present
  content = content.replace(
    "import { createServerClient } from '@supabase/ssr';",
    "import { createClient } from '@supabase/supabase-js';"
  );
  
  // Replace the function call (with fake cookies pattern)
  // Match: createServerClient(\n  url,\n  key,\n  { cookies: { getAll() { return []; }, setAll() {} } }\n)
  content = content.replace(
    /createServerClient\(\s*([\s\S]*?),\s*\{ cookies: \{ getAll\(\) \{ return \[\]; \}, setAll\(\) \{\} \} \}\s*\)/g,
    'createClient($1)'
  );

  // Replace any remaining bare createServerClient( calls that weren't caught
  content = content.replaceAll('createServerClient(', 'createClient(');
  
  writeFileSync(file, content);
  console.log('Fixed:', file);
  fixed++;
}

console.log(`\nTotal fixed: ${fixed} files`);
