const fs = require('fs');
const path = require('path');

const ignoreDirs = ['node_modules', '.git', 'build', 'dist', 'archive', 'templates'];

function findMarkdownFiles(dirPath, fileList = []) {
  const items = fs.readdirSync(dirPath);

  for (const item of items) {
    const itemPath = path.join(dirPath, item);
    const stats = fs.statSync(itemPath);

    if (stats.isDirectory()) {
      if (!ignoreDirs.includes(item)) {
        findMarkdownFiles(itemPath, fileList);
      }
    } else if (item.endsWith('.md')) {
      fileList.push(itemPath);
    }
  }
  return fileList;
}

function validateCrossReferences(filePath) {
  const content = fs.readFileSync(filePath, 'utf8');
  const internalLinkRegex = /\[([^\]]+)\]\((?!\s*http)([^)]+)\)/g; // Matches internal links
  let match;
  const errors = [];

  while ((match = internalLinkRegex.exec(content)) !== null) {
    const linkText = match[1];
    const linkUrl = match[2];

    // Basic check: Ensure internal links are relative and don't start with a slash (unless intentional from root)
    if (linkUrl.startsWith('/') && linkUrl.length > 1 && !linkUrl.startsWith('./') && !linkUrl.startsWith('../')) {
       errors.push(`Potentially absolute or incorrectly formatted internal link "${linkUrl}" in ${filePath}`);
    }

    // More advanced checks could include:
    // - Verifying anchor links (#section) point to existing headings within the target file
    // - Checking for consistent casing or naming conventions in paths

  }

  return { file: filePath, conforms: errors.length === 0, errors };
}

const markdownFiles = findMarkdownFiles('./docs');
const validationResults = markdownFiles.map(validateCrossReferences);

let report = '# Cross-reference Validation Report\n\n';
let allValid = true;

validationResults.forEach(result => {
  if (!result.conforms) {
    allValid = false;
    report += `## ❌ ${result.file}\n\n`;
    result.errors.forEach(error => {
      report += `- ${error}\n`;
    });
    report += '\n';
  } else {
    report += `✅ ${result.file} has valid internal link formats.\n`;
  }
});

if (allValid) {
  report += 'All internal cross-references have a valid format.\n';
}

fs.writeFileSync('cross-reference-validation-report.md', report);
console.log('Cross-reference validation completed. Results saved to cross-reference-validation-report.md');
