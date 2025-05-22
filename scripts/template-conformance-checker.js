const fs = require('fs');
const path = require('path');
const yaml = require('js-yaml'); // Need to install js-yaml

// Define expected template structures
const templates = {
  'architecture': {
    headings: [
      'Overview',
      'Design Principles',
      'Component Structure',
      'Data Flow',
      'Integration Points',
      'Security Considerations',
      'Performance Considerations',
      'Implementation Notes',
      'Future Considerations'
    ],
    // Add checks for YAML front matter if needed
  },
  'feature': {
    headings: [
      'Overview',
      'User Stories',
      'Functional Requirements',
      'Technical Implementation',
      'Data Flow',
      'UI Components',
      'Integration Points',
      'Error Handling',
      'Testing',
      'Future Considerations'
    ],
  },
  'api': {
    headings: [
      'Overview',
      'Endpoint',
      'Request',
      'Response',
      'Authentication and Authorization',
      'Error Handling',
      'Examples',
      'Future Considerations'
    ],
  },
  'implementation': {
    headings: [
      'Overview',
      'Code Structure',
      'Dependencies',
      'Key Logic',
      'Data Structures',
      'Error Handling',
      'Testing',
      'Notes and Considerations',
      'Future Improvements'
    ],
  },
  'workflow': {
    headings: [
      'Overview',
      'Trigger',
      'Steps',
      'Data Flow',
      'Error Handling',
      'Monitoring and Logging',
      'Future Considerations'
    ],
  }
};

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

function getTemplateType(filePath) {
  // Determine template type based on file path or content
  // This is a simplified approach, might need refinement
  if (filePath.includes('architecture')) return 'architecture';
  if (filePath.includes('features')) return 'feature';
  if (filePath.includes('api')) return 'api';
  if (filePath.includes('implementation')) return 'implementation';
  if (filePath.includes('guides')) return 'workflow'; // Guides often follow workflow or general structure
  // Add more sophisticated logic if needed
  return null; // Unknown type
}

function checkConformance(filePath) {
  const content = fs.readFileSync(filePath, 'utf8');
  const lines = content.split('\n');
  const frontMatterMatch = content.match(/^---\n([\s\S]+?)\n---/);
  let fileContent = content;
  let frontMatter = null;

  if (frontMatterMatch && frontMatterMatch[1]) {
    try {
      frontMatter = yaml.load(frontMatterMatch[1]);
      fileContent = content.substring(frontMatterMatch[0].length);
    } catch (e) {
      console.warn(`Warning: Could not parse YAML front matter in ${filePath}: ${e.message}`);
    }
  }

  const extractedHeadings = fileContent
    .split('\n')
    .filter(line => line.startsWith('## '))
    .map(line => line.replace('## ', '').trim());

  const templateType = getTemplateType(filePath);

  if (!templateType || !templates[templateType]) {
    return { file: filePath, conforms: false, errors: [`Could not determine template type or template not found for ${templateType}`] };
  }

  const expectedHeadings = templates[templateType].headings;
  const errors = [];

  // Check for missing headings
  expectedHeadings.forEach(expected => {
    if (!extractedHeadings.includes(expected)) {
      errors.push(`Missing expected heading: "## ${expected}"`);
    }
  });

  // Check for unexpected headings
  extractedHeadings.forEach(extracted => {
    if (!expectedHeadings.includes(extracted)) {
      errors.push(`Unexpected heading found: "## ${extracted}"`);
    }
  });

  // Add checks for YAML front matter fields if needed
  // if (templates[templateType].requiredFrontMatter) {
  //   templates[templateType].requiredFrontMatter.forEach(field => {
  //     if (!frontMatter || !frontMatter.hasOwnProperty(field)) {
  //       errors.push(`Missing required front matter field: "${field}"`);
  //     }
  //   });
  // }


  return { file: filePath, conforms: errors.length === 0, errors };
}

const markdownFiles = findMarkdownFiles('./docs');
const conformanceResults = markdownFiles.map(checkConformance);

let report = '# Template Conformance Report\n\n';
let allConform = true;

conformanceResults.forEach(result => {
  if (!result.conforms) {
    allConform = false;
    report += `## ❌ ${result.file}\n\n`;
    result.errors.forEach(error => {
      report += `- ${error}\n`;
    });
    report += '\n';
  } else {
    report += `✅ ${result.file} conforms to template.\n`;
  }
});

if (allConform) {
  report += 'All markdown files conform to their respective templates.\n';
}

fs.writeFileSync('template-conformance-report.md', report);
console.log('Template conformance check completed. Results saved to template-conformance-report.md');
