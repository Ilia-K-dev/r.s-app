// File: doc-similarity.js
// Created: 2025-05-15 03:11:04
// Description: Script to analyze document similarity.

const fs = require('fs');
const path = require('path');

function similarity(str1, str2) {
  const set1 = new Set(str1.toLowerCase().split(/\s+/).filter(word => word.length > 3));
  const set2 = new Set(str2.toLowerCase().split(/\s+/).filter(word => word.length > 3));
  
  const intersection = new Set([...set1].filter(x => set2.has(x)));
  const union = new Set([...set1, ...set2]);
  
  return intersection.size / union.size;
}

function analyzeDocuments(files) {
  const similarities = [];
  
  for (let i = 0; i < files.length; i++) {
    for (let j = i + 1; j < files.length; j++) {
      const content1 = fs.readFileSync(files[i], 'utf8');
      const content2 = fs.readFileSync(files[j], 'utf8');
      
      const sim = similarity(content1, content2);
      if (sim > 0.2) { // Only report significant similarities
        similarities.push({
          file1: files[i],
          file2: files[j],
          similarity: sim
        });
      }
    }
  }
  
  similarities.sort((a, b) => b.similarity - a.similarity);
  return similarities;
}

// Usage example
const mdFiles = [
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

const results = analyzeDocuments(mdFiles);

let report = '# Document Similarity Analysis\n\n';
report += '| File 1 | File 2 | Similarity |\n';
report += '|--------|--------|------------|\n';

results.forEach(result => {
  report += `| ${result.file1} | ${result.file2} | ${(result.similarity * 100).toFixed(2)}% |\n`;
});

fs.writeFileSync('similarity-report.md', report);
console.log('Similarity analysis completed. Results saved to similarity-report.md');
