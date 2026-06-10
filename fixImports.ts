import fs from 'fs';
import path from 'path';

function replaceInFile(filePath: string) {
  try {
    let content = fs.readFileSync(filePath, 'utf-8');
    // We want to replace `from 'firebase/firestore'` with `from '../firebase'` (or `../../firebase` depending on depth)
    // For components in src/components/, it's `../firebase`
    // For hooks in src/hooks/, it's `../firebase`
    const relativePath = filePath.includes('/components/') || filePath.includes('/hooks/') ? '../firebase' : './firebase';
    const newContent = content.replace(/from\s+['"]firebase\/firestore['"]/g, `from '${relativePath}'`);
    if (content !== newContent) {
      fs.writeFileSync(filePath, newContent, 'utf-8');
      console.log(`Updated imports in: ${filePath}`);
    }
  } catch (err) {
    console.error(`Failed to update ${filePath}`, err);
  }
}

const filesToUpdate = [
  'src/components/AcessorioFilterManager.tsx',
  'src/components/AcessorioConfigManager.tsx',
  'src/components/CartModal.tsx',
  'src/components/AcessorioKanban.tsx',
  'src/hooks/useAcessoriosConfig.ts'
];

filesToUpdate.forEach(replaceInFile);
console.log('Fixed imports complete.');
