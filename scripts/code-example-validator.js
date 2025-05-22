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

function validateCodeExamples(filePath) {
  const content = fs.readFileSync(filePath, 'utf8');
  const codeBlockRegex = /```(?:\w+)?\n([\s\S]+?)\n```/g;
  let match;
  const errors = [];
  let codeBlockIndex = 0;

  while ((match = codeBlockRegex.exec(content)) !== null) {
    codeBlockIndex++;
    const language = match[0].substring(3, match[0].indexOf('\n')).trim();
    if (!language) {
      errors.push(`Code block ${codeBlockIndex} in ${filePath} is missing a language specifier.`);
    }
    // More advanced validation (e.g., syntax check) would go here
    // This would require integrating with language-specific tools
  }

  return { file: filePath, conforms: errors.length === 0, errors };
}

const markdownFiles = findMarkdownFiles('./docs');
const validationResults = markdownFiles.map(validateCodeExamples);

let report = '# Code Example Validation Report\n\n';
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
    report += `✅ ${result.file} has valid code examples (language specified).\n`;
  }
});

if (allValid) {
  report += 'All code examples have a language specifier.\n';
}

fs.writeFileSync('code-example-validation-report.md', report);
console.log('Code example validation completed. Results saved to code-example-validation-report.md');
