const fs = require('fs');
const path = require('path');
const projectDir = process.cwd();
const ignoreDirs = ['node_modules', '.next', '.git', 'dist', 'build', '.gemini'];
const targetExtensions = ['.js', '.jsx', '.ts', '.tsx', '.css', '.html', '.env', '.local', '.gitignore'];
function removeComments(content, ext) {
    if (ext === '.js' || ext === '.jsx' || ext === '.ts' || ext === '.tsx' || ext === '.css') {
        content = content.replace(/\/\*[\s\S]*?\*\
        content = content.replace(/([^:])\/\/.*$/gm, '$1');
    }
    if (ext === '.html') {
        content = content.replace(/<!--[\s\S]*?-->/g, '');
    }
    if (ext === '.env' || ext === '.local' || ext === '.gitignore' || ext === '.yml' || ext === '.yaml') {
        content = content.replace(/#.*$/gm, '');
    }
    return content.split('\n').filter(line => line.trim() !== '').join('\n');
}
function processDirectory(dir) {
    const files = fs.readdirSync(dir);
    for (const file of files) {
        const fullPath = path.join(dir, file);
        const stat = fs.statSync(fullPath);
        if (stat.isDirectory()) {
            if (!ignoreDirs.includes(file)) {
                processDirectory(fullPath);
            }
        } else {
            const ext = path.extname(file);
            if (targetExtensions.includes(ext) || file === '.env.local' || file === '.gitignore') {
                console.log(`Processing: ${fullPath}`);
                const content = fs.readFileSync(fullPath, 'utf8');
                const cleanedContent = removeComments(content, ext || file);
                fs.writeFileSync(fullPath, cleanedContent, 'utf8');
            }
        }
    }
}
console.log('--- GLOBAL COMMENT REMOVAL STARTED ---');
processDirectory(projectDir);
console.log('--- GLOBAL COMMENT REMOVAL COMPLETED ---');