## UI Component Consolidation Plan
- [x] Remove duplicate Button component
- [x] Update all imports
- [ ] Standardize props and variants
- [ ] Create component documentation

// Step 1: Document all Button usages
const buttonUsageAudit = {
  formsButton: [
    'client/src/features/auth/components/LoginPage.js:45',
    'client/src/features/auth/components/RegisterPage.js:67',
    'client/src/features/receipts/components/ReceiptForm.js:123'
  ],
  uiButton: [
    'client/src/features/analytics/components/Dashboard.js:78',
    'client/src/shared/components/layout/Navbar.js:34'
  ]
};

## Completed Steps
- Documented button usages.
- Created `scripts/migrate-button-imports.js` and applied its logic to update imports.
- Deleted the duplicate Button component file (`client/src/shared/components/forms/Button.js`).
