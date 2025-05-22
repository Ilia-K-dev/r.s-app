const fs = require('fs');
const path = require('path');

function validateLinks(filePath, basePath) {
  const content = fs.readFileSync(filePath, 'utf8');
  const links = [];

  // Match markdown links [text](url)
  const linkRegex = /\[([^\]]+)\]\(([^)]+)\)/g;
  let match;

  while ((match = linkRegex.exec(content)) !== null) {
    const [, text, url] = match;

    // Skip external links
    if (url.startsWith('http')) continue;

    // Remove anchor links
    const cleanUrl = url.split('#')[0];
    if (!cleanUrl) continue;

    // Check if relative link exists
    const targetPath = path.resolve(path.dirname(filePath), cleanUrl);
    const exists = fs.existsSync(targetPath);

    links.push({
      text,
      url,
      targetPath: path.relative(basePath, targetPath),
      exists
    });
  }

  return links;
}

function validateDocsDirectory(directory) {
  const allLinks = [];

  function processDirectory(dirPath) {
    const items = fs.readdirSync(dirPath);

    for (const item of items) {
      const itemPath = path.join(dirPath, item);
      const stats = fs.statSync(itemPath);

      if (stats.isDirectory()) {
        processDirectory(itemPath);
      } else if (item.endsWith('.md')) {
        const fileLinks = validateLinks(itemPath, directory);
        if (fileLinks.length > 0) {
          allLinks.push({
            file: path.relative(directory, itemPath),
            links: fileLinks
          });
        }
      }
    }
  }

  processDirectory(directory);
  return allLinks;
}

const results = validateDocsDirectory('./docs');

let report = '# Broken Links Report\n\n';

results.forEach(fileResult => {
  const brokenLinks = fileResult.links.filter(link => !link.exists);
  if (brokenLinks.length > 0) {
    report += `## ${fileResult.file}\n\n`;
    report += '| Link Text | Target | Status |\n';
    report += '|-----------|--------|--------|\n';

    brokenLinks.forEach(link => {
      report += `| ${link.text} | ${link.url} | ❌ Not Found |\n`;
    });

    report += '\n';
  }
});

fs.writeFileSync('broken-links-report.md', report);
console.log('Link validation completed. Results saved to broken-links-report.md');
