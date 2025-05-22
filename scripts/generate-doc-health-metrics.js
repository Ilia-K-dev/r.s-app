const fs = require('fs');
const path = require('path');
const yaml = require('js-yaml');

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

// Define expected template structures (same as in template-conformance-checker.js)
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

function getTemplateType(filePath) {
  // Determine template type based on file path (same as in template-conformance-checker.js)
  if (filePath.includes('architecture')) return 'architecture';
  if (filePath.includes('features')) return 'feature';
  if (filePath.includes('api')) return 'api';
  if (filePath.includes('implementation')) return 'implementation';
  if (filePath.includes('guides')) return 'workflow'; // Guides often follow workflow or general structure
  return null; // Unknown type
}


function calculateFreshness(inventoryPath) {
  const inventoryContent = fs.readFileSync(inventoryPath, 'utf8');
  const lines = inventoryContent.split('\n');
  let totalAgeInDays = 0;
  let fileCount = 0;
  const today = new Date();

  for (let i = 3; i < lines.length; i++) {
    const line = lines[i];
    const columns = line.split('|').map(col => col.trim()).filter(col => col !== '');
    if (columns.length > 4) { // Ensure there's a last modified date column
      const lastModifiedDateString = columns[4]; // Assuming the fifth column is Last Modified
      try {
        const lastModifiedDate = new Date(lastModifiedDateString);
        const ageInMilliseconds = today - lastModifiedDate;
        const ageInDays = ageInMilliseconds / (1000 * 60 * 60 * 24);
        totalAgeInDays += ageInDays;
        fileCount++;
      } catch (e) {
        console.warn(`Warning: Could not parse date "${lastModifiedDateString}" for file ${columns[0]}: ${e.message}`);
      }
    }
  }

  if (fileCount === 0) {
    return { averageAgeInDays: 0, fileCount: 0 };
  }

  return { averageAgeInDays: totalAgeInDays / fileCount, fileCount };
}

function calculateCompleteness(filePath) {
    const content = fs.readFileSync(filePath, 'utf8');
    const frontMatterMatch = content.match(/^---\n([\s\S]+?)\n---/);
    let fileContent = content;

    if (frontMatterMatch && frontMatterMatch[1]) {
        fileContent = content.substring(frontMatterMatch[0].length);
    }

    const extractedHeadings = fileContent
        .split('\n')
        .filter(line => line.startsWith('## '))
        .map(line => line.replace('## ', '').trim());

    const templateType = getTemplateType(filePath);

    if (!templateType || !templates[templateType]) {
        return { filePath, completeness: 0, totalExpected: 0, foundCount: 0, errors: [`Could not determine template type or template not found for ${templateType}`] };
    }

    const expectedHeadings = templates[templateType].headings;
    const totalExpected = expectedHeadings.length;
    let foundCount = 0;

    expectedHeadings.forEach(expected => {
        if (extractedHeadings.includes(expected)) {
            foundCount++;
        }
    });

    const completeness = totalExpected > 0 ? (foundCount / totalExpected) * 100 : 100; // 100% if no expected headings

    return { filePath, completeness, totalExpected, foundCount, errors: [] };
}

function getRecentUpdates(markdownFiles) {
    const recentUpdates = [];
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    markdownFiles.forEach(filePath => {
        try {
            const content = fs.readFileSync(filePath, 'utf8');
            const frontMatterMatch = content.match(/^---\n([\s\S]+?)\n---/);

            if (frontMatterMatch && frontMatterMatch[1]) {
                try {
                    const frontMatter = yaml.load(frontMatterMatch[1]);
                    if (frontMatter && frontMatter.update_history && Array.isArray(frontMatter.update_history)) {
                        frontMatter.update_history.forEach(update => {
                            try {
                                const updateDate = new Date(update.date);
                                if (updateDate >= sevenDaysAgo) {
                                    recentUpdates.push({
                                        file: filePath,
                                        date: update.date,
                                        description: update.description || 'No description'
                                    });
                                }
                            } catch (e) {
                                console.warn(`Warning: Could not parse update date "${update.date}" in ${filePath}: ${e.message}`);
                            }
                        });
                    }
                } catch (e) {
                    console.warn(`Warning: Could not parse YAML front matter in ${filePath}: ${e.message}`);
                }
            }
        } catch (e) {
            console.error(`Error reading file ${filePath}: ${e.message}`);
        }
    });

    // Sort by date, most recent first
    recentUpdates.sort((a, b) => new Date(b.date) - new Date(a.date));

    return recentUpdates;
}

function getDocumentationIssuesSummary() {
    const issuesSummary = [];
    const reportFiles = [
        { name: 'Broken Links', path: './broken-links-report.md' },
        { name: 'Template Conformance', path: './template-conformance-report.md' },
        { name: 'Code Example Validation', path: './code-example-validation-report.md' },
        { name: 'Cross-reference Validation', path: './cross-reference-validation-report.md' }
    ];

    reportFiles.forEach(reportFile => {
        if (fs.existsSync(reportFile.path)) {
            const content = fs.readFileSync(reportFile.path, 'utf8');
            const issueMatches = content.match(/## ❌/g);
            const issueCount = issueMatches ? issueMatches.length : 0;
            issuesSummary.push({
                name: reportFile.name,
                count: issueCount,
                reportPath: reportFile.path
            });
        } else {
            issuesSummary.push({
                name: reportFile.name,
                count: 'N/A (Report not found)',
                reportPath: reportFile.path
            });
        }
    });

    return issuesSummary;
}


function generateHealthMetrics() {
  const inventoryPath = './documentation-inventory.md';
  const reportPath = './documentation-health-metrics.md';

  // Calculate Freshness
  const freshnessMetrics = calculateFreshness(inventoryPath);

  // Calculate Completeness (basic heading check)
  const markdownFiles = findMarkdownFiles('./docs');
  const completenessResults = markdownFiles.map(calculateCompleteness);

  let totalCompletenessPercentage = 0;
  let filesWithTemplates = 0;
  completenessResults.forEach(result => {
      if (getTemplateType(result.filePath)) { // Only include files with a determined template type
          totalCompletenessPercentage += result.completeness;
          filesWithTemplates++;
      }
  });
  const averageCompleteness = filesWithTemplates > 0 ? totalCompletenessPercentage / filesWithTemplates : 0;

  // Get Recent Updates
  const recentUpdates = getRecentUpdates(markdownFiles);

  // Get Documentation Issues Summary
  const issuesSummary = getDocumentationIssuesSummary();


  let report = '# Documentation Health Metrics\n\n';
  report += 'This report provides key metrics on the health of the documentation.\n\n';

  report += '## Freshness\n\n';
  report += `Average age of markdown files (based on last modified date): ${freshnessMetrics.averageAgeInDays.toFixed(2)} days (across ${freshnessMetrics.fileCount} files)\n\n`;

  report += '## Completeness (Basic Heading Check)\n\n';
  report += `Average percentage of expected headings found in templated documents: ${averageCompleteness.toFixed(2)}% (across ${filesWithTemplates} files with determined template types)\n\n`;

  report += '### Completeness Details per File\n\n';
   report += '| File Path | Template Type | Completeness (%) | Headings Found | Total Expected Headings | Notes |\n';
   report += '|-----------|---------------|------------------|----------------|-------------------------|-------|\n';
   completenessResults.forEach(result => {
       const templateType = getTemplateType(result.filePath) || 'N/A';
       const notes = result.errors.length > 0 ? result.errors.join(', ') : '';
       report += `| ${result.filePath} | ${templateType} | ${result.completeness.toFixed(2)} | ${result.foundCount} | ${result.totalExpected} | ${notes} |\n`;
   });
   report += '\n';

  report += '## Recent Documentation Updates (Last 7 Days)\n\n';
  if (recentUpdates.length > 0) {
      report += '| Date | File Path | Description |\n';
      report += '|------|-----------|-------------|\n';
      recentUpdates.forEach(update => {
          report += `| ${update.date} | ${update.file} | ${update.description} |\n`;
      });
      report += '\n';
  } else {
      report += 'No recent documentation updates in the last 7 days.\n\n';
  }


  report += '## Documentation Issues Summary\n\n';
  if (issuesSummary.length > 0) {
      report += 'Summary of issues found by validation scripts:\n\n';
      issuesSummary.forEach(summary => {
          report += `- ${summary.name}: ${summary.count} issues ([View Report](${summary.reportPath}))\n`;
      });
      report += '\n';
  } else {
      report += 'No documentation issue reports found.\n\n';
  }


  // Add placeholders for other metrics
  report += '## Coverage\n\n';
  report += '[Metric for documentation coverage of codebase components/features - requires more advanced analysis]\n\n';

  report += '## Cross-reference Completeness\n\n';
  report += '[Metric for completeness of cross-references between documents - requires more advanced analysis]\n\n';


  fs.writeFileSync(reportPath, report);
  console.log(`Documentation health metrics generated at "${reportPath}"`);
}

generateHealthMetrics();
