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
  [/124,58,237/g, '124,58,237'],
  [/VecturaBrandingIcon/g, 'VecturaBrandingIcon'],
];

processDirectory(process.cwd(), themeReplacements);
console.log('Update complete.');
