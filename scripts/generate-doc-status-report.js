const fs = require('fs');
const path = require('path');
const yaml = require('js-yaml');

function generateStatusReport() {
  const inventoryPath = './documentation-inventory.md';
  const reportPath = './documentation-status-report.md';
  const statusCounts = {};
  const filesWithoutStatus = [];

  if (!fs.existsSync(inventoryPath)) {
    console.error(`Error: Documentation inventory file not found at "${inventoryPath}". Please run the inventory generation script first.`);
    process.exit(1);
  }

  const inventoryContent = fs.readFileSync(inventoryPath, 'utf8');
  const lines = inventoryContent.split('\n');
  const markdownFiles = [];

  // Extract markdown file paths from the inventory table (skipping header and separator lines)
  for (let i = 3; i < lines.length; i++) {
    const line = lines[i];
    const columns = line.split('|').map(col => col.trim()).filter(col => col !== '');
    if (columns.length > 0) {
      markdownFiles.push(columns[0]); // Assuming the first column is the file path
    }
  }

  markdownFiles.forEach(filePath => {
    try {
      const content = fs.readFileSync(filePath, 'utf8');
      const frontMatterMatch = content.match(/^---\n([\s\S]+?)\n---/);
      let status = 'Unknown';

      if (frontMatterMatch && frontMatterMatch[1]) {
        try {
          const frontMatter = yaml.load(frontMatterMatch[1]);
          if (frontMatter && frontMatter.status) {
            status = frontMatter.status;
          } else {
            filesWithoutStatus.push(filePath);
          }
        } catch (e) {
          console.warn(`Warning: Could not parse YAML front matter in ${filePath}: ${e.message}`);
          filesWithoutStatus.push(filePath);
        }
      } else {
        filesWithoutStatus.push(filePath);
      }

      statusCounts[status] = (statusCounts[status] || 0) + 1;

    } catch (e) {
      console.error(`Error reading file ${filePath}: ${e.message}`);
    }
  });

  let report = '# Documentation Status Report\n\n';
  report += 'This report summarizes the status of the markdown documentation files.\n\n';

  report += '## Status Summary\n\n';
  report += '| Status | Count |\n';
  report += '|--------|-------|\n';
  for (const status in statusCounts) {
    report += `| ${status} | ${statusCounts[status]} |\n`;
  }
  report += '\n';

  if (filesWithoutStatus.length > 0) {
    report += '## Files Without Status in Front Matter\n\n';
    filesWithoutStatus.forEach(file => {
      report += `- ${file}\n`;
    });
    report += '\n';
  }

  fs.writeFileSync(reportPath, report);
  console.log(`Documentation status report generated at "${reportPath}"`);
}

generateStatusReport();
