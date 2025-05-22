// File: doc-inventory.js
// Created: 2025-05-15 03:10:43
// Modified: 2025-05-15 03:12:08
// Description: Script to generate a markdown documentation inventory.
// Changes:
// - Added word count calculation for each markdown file.
// - Modified the output markdown table to include Word Count, Category, Status, Primary Subject, and Action columns.
// - Changed the output path of the inventory file to docs/management/documentation-inventory.md.

const fs = require('fs');
const path = require('path');

const ignoreDirs = ['node_modules', '.git', 'build', 'dist'];
const mdFiles = [];

function scanDir(dirPath, relativePath = '') {
  if (ignoreDirs.some(dir => dirPath.includes(dir))) return;
  
  const items = fs.readdirSync(dirPath);
  
  for (const item of items) {
    const itemPath = path.join(dirPath, item);
    const itemRelativePath = path.join(relativePath, item);
    const stats = fs.statSync(itemPath);
    
    if (stats.isDirectory()) {
      scanDir(itemPath, itemRelativePath);
    } else if (item.endsWith('.md')) {
      const content = fs.readFileSync(itemPath, 'utf8');
      const lines = content.split('\n');
      const title = lines.find(line => line.startsWith('# '))?.replace('# ', '') || 'Untitled';
      const size = stats.size;
      const created = stats.birthtime;
      const modified = stats.mtime;
      const wordCount = content.split(/\s+/).filter(word => word.length > 0).length;
      
      mdFiles.push({
        path: itemRelativePath,
        title,
        size: (size / 1024).toFixed(2) + ' KB',
        created: created.toISOString(),
        modified: modified.toISOString(),
        wordCount
      });
    }
  }
}

scanDir('.');

// Create markdown table
let mdTable = '# Documentation Inventory\n\n';
mdTable += '| File Path | Title | Creation Date | Last Modified | Size (KB) | Word Count | Category | Status | Primary Subject | Action |\n';
mdTable += '|-----------|-------|--------------|---------------|-----------|------------|----------|--------|----------------|--------|\n';

mdFiles.forEach(file => {
  mdTable += `| ${file.path} | ${file.title} | ${file.created.split('T')[0]} | ${file.modified.split('T')[0]} | ${file.size} | ${file.wordCount} |  |  |  |  |\n`;
});

fs.writeFileSync('docs/management/documentation-inventory.md', mdTable);
console.log(`Found ${mdFiles.length} markdown files. Inventory saved to docs/management/documentation-inventory.md`);
