const fs = require('fs');
const path = require('path');

function analyzeDocumentQuality(filePath) {
  const content = fs.readFileSync(filePath, 'utf8');
  const lines = content.split('\n');
  const wordCount = content.split(/\s+/).length;
  
  // Extract headings
  const headings = lines
    .filter(line => line.startsWith('#'))
    .map(line => {
      const level = line.match(/^#+/)[0].length;
      const text = line.replace(/^#+\s+/, '');
      return { level, text };
    });
  
  // Check for code examples
  const codeBlocks = content.match(/```[\s\S]+?```/g) || [];
  
  // Check for images or diagrams
  const images = content.match(/!\[.*?\]\(.*?\)/g) || [];
  
  // Check for tables
  const tables = content.match(/\|[\s\S]+?\|/g) || [];
  
  // Check for update history
  const hasUpdateHistory = content.includes('update_history') || 
                          content.includes('last updated') || 
                          content.includes('last modified');
  
  // Check for related documents
  const hasRelatedDocs = content.includes('related_files') || 
                        content.includes('See also') || 
                        content.includes('Related documents');
  
  return {
    filename: path.basename(filePath),
    wordCount,
    headingCount: headings.length,
    headingStructure: headings,
    codeExamples: codeBlocks.length,
    images: images.length,
    tables: tables.length,
    hasUpdateHistory,
    hasRelatedDocs,
    score: calculateScore({
      wordCount,
      headingCount: headings.length,
      codeExamples: codeBlocks.length,
      images: images.length,
      tables: tables.length,
      hasUpdateHistory,
      hasRelatedDocs
    })
  };
}

function calculateScore(metrics) {
  let score = 0;
  
  // Document length (0-20 points)
  if (metrics.wordCount > 2000) score += 20;
  else if (metrics.wordCount > 1000) score += 15;
  else if (metrics.wordCount > 500) score += 10;
  else if (metrics.wordCount > 200) score += 5;
  
  // Heading structure (0-20 points)
  if (metrics.headingCount > 10) score += 20;
  else if (metrics.headingCount > 5) score += 15;
  else if (metrics.headingCount > 3) score += 10;
  else if (metrics.headingCount > 0) score += 5;
  
  // Code examples (0-20 points)
  if (metrics.codeExamples > 5) score += 20;
  else if (metrics.codeExamples > 3) score += 15;
  else if (metrics.codeExamples > 1) score += 10;
  else if (metrics.codeExamples > 0) score += 5;
  
  // Visuals (0-15 points)
  if (metrics.images > 3) score += 15;
  else if (metrics.images > 1) score += 10;
  else if (metrics.images > 0) score += 5;
  
  // Tables (0-10 points)
  if (metrics.tables > 2) score += 10;
  else if (metrics.tables > 0) score += 5;
  
  // Metadata (0-15 points)
  if (metrics.hasUpdateHistory) score += 10;
  if (metrics.hasRelatedDocs) score += 5;
  
  return score;
}

// Example usage
const docsToAnalyze = [
  'docs/core/architecture.md',
  'docs/core/data-flows.md',
  'docs/core/data-model.md',
  'docs/core/project-structure.md',
  'docs/core/README.md',
  'docs/core/security-model.md',
  'docs/features/README.md',
  'docs/features/analytics/calculations-metrics.md',
  'docs/features/analytics/data-sources.md',
  'docs/features/analytics/export.md',
  'docs/features/analytics/filtering-customization.md',
  'docs/features/analytics/implementation.md',
  'docs/features/analytics/overview.md',
  'docs/features/analytics/visualization.md',
  'docs/features/auth/firebase-auth.md',
  'docs/features/auth/implementation.md',
  'docs/features/auth/overview.md',
  'docs/features/auth/roles-permissions.md',
  'docs/features/documents/lifecycle.md',
  'docs/features/documents/metadata.md',
  'docs/features/documents/overview.md',
  'docs/features/documents/storage.md',
  'docs/features/inventory/alerts-notifications.md',
  'docs/features/inventory/data-models.md',
  'docs/features/inventory/implementation.md',
  'docs/features/inventory/overview.md',
  'docs/features/inventory/search-filter.md',
  'docs/features/inventory/stock-management.md',
  'docs/features/receipts/overview.md',
  'docs/features/receipts/processing.md',
  'docs/features/receipts/scanning.md',
  'docs/features/receipts/search-filter.md',
  'docs/features/receipts/storage.md',
  'docs/firebase/authentication.md',
  'docs/firebase/firestore.md',
  'docs/firebase/integration-architecture.md',
  'docs/firebase/migration-history.md',
  'docs/firebase/migration.md',
  'docs/firebase/overview.md',
  'docs/firebase/README.md',
  'docs/firebase/security-rules.md',
  'docs/firebase/testing.md',
  'docs/api/firebase/auth.md',
  'docs/api/firebase/firestore.md',
  'docs/api/firebase/storage.md',
  'docs/developer/specifications/specification-api.md',
  'docs/guides/code-review-guidelines.md',
  'docs/guides/deployment-process.md',
  'docs/guides/development-process-workflow.md',
  'docs/guides/development-setup.md',
  'docs/guides/documentation-update-process.md',
  'docs/guides/error-handling.md',
  'docs/guides/feature-flag-management.md',
  'docs/guides/README.md',
  'docs/guides/release-process.md',
  'docs/guides/testing-environment.md',
  'docs/guides/testing-requirements.md',
  'docs/guides/tools-and-utilities.md',
  'docs/developer/guides/feature-toggle-system.md',
  'docs/developer/guides/guide-accessibility.md',
  'docs/developer/guides/guide-deployment.md',
  'docs/developer/guides/guide-error-handling-standards.md',
  'docs/developer/guides/guide-ui-component-usage.md',
  'docs/user/firebase-integration-changes.md',
  'docs/user/user-guide.md'
];

let report = '# Documentation Quality Report\n\n';
report += '| Document | Word Count | Headings | Code Examples | Images | Tables | Update History | Related Docs | Quality Score |\n';
report += '|----------|------------|----------|---------------|--------|--------|----------------|--------------|---------------|\n';

docsToAnalyze.forEach(docPath => {
  try {
    const analysis = analyzeDocumentQuality(docPath);
    report += `| ${analysis.filename} | ${analysis.wordCount} | ${analysis.headingCount} | ${analysis.codeExamples} | ${analysis.images} | ${analysis.tables} | ${analysis.hasUpdateHistory ? '✅' : '❌'} | ${analysis.hasRelatedDocs ? '✅' : '❌'} | ${analysis.score}/100 |\n`;
  } catch (error) {
    console.error(`Error analyzing ${docPath}: ${error.message}`);
  }
});

fs.writeFileSync('quality-report.md', report);
console.log('Quality analysis completed. Results saved to quality-report.md');
