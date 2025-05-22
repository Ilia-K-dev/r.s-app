// Step 2: Create migration script
const migrateButtonImports = () => {
  buttonUsageAudit.formsButton.forEach(file => {
    // Replace import statement
    replaceInFile(file, {
      search: "import Button from '../../shared/components/forms/Button'",
      replace: "import Button from '../../shared/components/ui/Button'"
    });
  });
};
