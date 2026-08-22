import fs from 'fs';
import path from 'path';

const dir = 'src';
const filesToProcess = [];

function walkDir(currentPath) {
  const files = fs.readdirSync(currentPath);
  for (const file of files) {
    const fullPath = path.join(currentPath, file);
    if (fs.statSync(fullPath).isDirectory()) {
      walkDir(fullPath);
    } else if (fullPath.endsWith('.tsx') || fullPath.endsWith('.ts')) {
      filesToProcess.push(fullPath);
    }
  }
}

walkDir(dir);

let modifiedCount = 0;

for (const file of filesToProcess) {
  let content = fs.readFileSync(file, 'utf8');
  if (content.includes('alert(')) {
    // Determine if we need to add the import
    if (!content.includes('react-hot-toast')) {
      // add import toast from 'react-hot-toast' at the top
      content = `import toast from 'react-hot-toast';\n` + content;
    }

    // Heuristics for success vs error
    const lines = content.split('\n');
    for (let i = 0; i < lines.length; i++) {
      if (lines[i].includes('alert(')) {
        if (lines[i].toLowerCase().includes('başarı') || lines[i].toLowerCase().includes('kaydedildi') || lines[i].toLowerCase().includes('başlatıldı')) {
          lines[i] = lines[i].replace(/alert\(/g, 'toast.success(');
        } else {
          lines[i] = lines[i].replace(/alert\(/g, 'toast.error(');
        }
      }
    }
    fs.writeFileSync(file, lines.join('\n'));
    modifiedCount++;
    console.log(`Updated ${file}`);
  }
}

console.log(`Done! Modified ${modifiedCount} files.`);
