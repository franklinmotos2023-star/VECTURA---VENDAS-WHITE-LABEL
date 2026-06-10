import fs from 'fs';
import path from 'path';

function replaceInFile(filePath: string, replacements: [RegExp, string][]) {
  try {
    let content = fs.readFileSync(filePath, 'utf-8');
    let hasChanges = false;
    for (const [regex, replacement] of replacements) {
      if (regex.test(content)) {
        content = content.replace(regex, replacement);
        hasChanges = true;
      }
    }
    if (hasChanges) {
      fs.writeFileSync(filePath, content, 'utf-8');
      console.log(`Updated: ${filePath}`);
    }
  } catch (err) {
    console.error(`Failed to update ${filePath}`, err);
  }
}

function processDirectory(dir: string, replacements: [RegExp, string][]) {
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const fullPath = path.join(dir, file);
    const stat = fs.statSync(fullPath);
    if (stat.isDirectory()) {
      processDirectory(fullPath, replacements);
    } else if (fullPath.endsWith('.tsx') || fullPath.endsWith('.ts') || fullPath.endsWith('.html') || fullPath.endsWith('.json')) {
      replaceInFile(fullPath, replacements);
    }
  }
}

const themeReplacements: [RegExp, string][] = [
  [/purple-600/g, 'purple-600'],
  [/purple-500/g, 'purple-500'],
  [/purple-700/g, 'purple-700'],
  [/purple-400/g, 'purple-400'],
  [/purple-200/g, 'purple-200'],
  [/VECTURA/g, 'VECTURA'],
  [/VECTURA/g, 'VECTURA'],
  [/VECTURA <span/g, 'VECTURA <span'],
  [/VECTURA <span/g, 'VECTURA <span'],
  [/"name":\s*"VENDAS - WHITE LABEL"/g, '"name": "VECTURA"'],
  [/<title>VECTURA - VENDAS<\/title>/g, '<title>VECTURA</title>']
];

processDirectory(process.cwd(), themeReplacements);
console.log('Update complete.');
