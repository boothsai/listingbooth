import fs from 'fs';
import path from 'path';

function walkPathSync(dir, fileList = []) {
  if (!fs.existsSync(dir)) return fileList;
  fs.readdirSync(dir).forEach(file => {
    const filePath = path.join(dir, file);
    if (fs.statSync(filePath).isDirectory()) {
      walkPathSync(filePath, fileList);
    } else if (file.endsWith('.ts') || file.endsWith('.tsx')) {
      fileList.push(filePath);
    }
  });
  return fileList;
}

const targetDirs = [
  path.join(process.cwd(), 'src', 'app'),
  path.join(process.cwd(), 'src', 'lib')
];

let files = [];
targetDirs.forEach(dir => walkPathSync(dir, files));

let modifiedCount = 0;

files.forEach(file => {
  let content = fs.readFileSync(file, 'utf8');
  let originalContent = content;

  // 1. await cookies() -> cookies()
  content = content.replace(/await cookies\(\)/g, "cookies()");
  
  // 2. await params -> params (For destructuring: const { id } = await params)
  content = content.replace(/await params/g, "params");
  
  // 3. await searchParams -> searchParams
  content = content.replace(/await searchParams/g, "searchParams");
  
  // 4. (await params).token -> params.token
  content = content.replace(/\(await params\)\./g, "params.");

  // 5. Types: params: Promise<{ id: string }> -> params: { id: string }
  // This regex is a bit tricky, but handles common cases
  content = content.replace(/params\s*:\s*Promise<([^>]+)>/g, "params: $1");
  content = content.replace(/searchParams\s*:\s*Promise<([^>]+)>/g, "searchParams: $1");

  if (content !== originalContent) {
    fs.writeFileSync(file, content);
    modifiedCount++;
    console.log(`Updated: ${file.replace(process.cwd(), '')}`);
  }
});

console.log(`\nOperation Complete. Modified ${modifiedCount} files.`);
