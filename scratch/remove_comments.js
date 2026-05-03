const fs = require('fs');
const path = require('path');

const EXCLUDE_DIRS = ['node_modules', '.next', '.git', 'dist', 'public'];
const FILE_EXTENSIONS = ['.js', '.jsx', '.ts', '.tsx', '.css'];

function stripComments(code, extension) {
  if (extension === '.css') {
    return code.replace(/\/\*[\s\S]*?\*\//g, '');
  }

  
  
  const regex = /("([^"\\]|\\.)*")|('([^'\\]|\\.)*')|(`([^`\\]|\\.)*`)|(\/\*[\s\S]*?\*\/)|(\/\/(?:(?!\r?\n).)*)/g;

  return code.replace(regex, (match, g1, g2, g3, g4, g5, g6, multiCase, singleCase) => {
    if (multiCase) return ''; 
    if (singleCase) return ''; 
    return match; // Keep strings
  });
}

async function walk(dir) {
  let files = [];
  const list = fs.readdirSync(dir);
  for (const file of list) {
    const fullPath = path.join(dir, file);
    const stat = fs.statSync(fullPath);
    if (stat.isDirectory()) {
      if (!EXCLUDE_DIRS.includes(file)) {
        files = files.concat(await walk(fullPath));
      }
    } else {
      if (FILE_EXTENSIONS.includes(path.extname(file))) {
        files.push(fullPath);
      }
    }
  }
  return files;
}

async function run() {
  const rootDir = process.cwd();
  console.log(`Scanning project for files: ${rootDir}`);
  
  const files = await walk(rootDir);
  console.log(`Found ${files.length} source files.`);

  let processedCount = 0;
  for (const file of files) {
    try {
      const content = fs.readFileSync(file, 'utf8');
      const ext = path.extname(file);
      const stripped = stripComments(content, ext);
      
      if (content !== stripped) {
        fs.writeFileSync(file, stripped, 'utf8');
        processedCount++;
      }
    } catch (err) {
      console.error(`Error processing ${file}:`, err.message);
    }
  }

  console.log(`--- Done ---`);
  console.log(`Total files modified: ${processedCount}`);
}

run();
