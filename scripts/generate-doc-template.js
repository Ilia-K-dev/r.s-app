const fs = require('fs');
const path = require('path');

const templatesDir = './docs/templates';

function generateTemplate(templateType, outputPath, title) {
  const templatePath = path.join(templatesDir, `${templateType}-template.md`);

  if (!fs.existsSync(templatePath)) {
    console.error(`Error: Template "${templateType}-template.md" not found.`);
    process.exit(1);
  }

  let templateContent = fs.readFileSync(templatePath, 'utf8');

  // Replace placeholders
  const now = new Date();
  const date = now.toISOString().split('T')[0];
  const time = now.toTimeString().split(' ')[0];

  templateContent = templateContent.replace(/YYYY-MM-DD HH:MM:SS/g, `${date} ${time}`);
  templateContent = templateContent.replace(/YYYY-MM-DD/g, date);
  templateContent = templateContent.replace(/\[Architecture Component\]/g, title || 'New Architecture Component');
  templateContent = templateContent.replace(/\[Feature Name\]/g, title || 'New Feature');
  templateContent = templateContent.replace(/\[API Endpoint\/Service\]/g, title || 'New API Endpoint/Service');
  templateContent = templateContent.replace(/\[Component\/Module\]/g, title || 'New Component/Module');
  templateContent = templateContent.replace(/\[Workflow Name\]/g, title || 'New Workflow');
  templateContent = templateContent.replace(/\[In Progress\/Completed\]/g, 'In Progress');
  templateContent = templateContent.replace(/\[Related document paths\]/g, ''); // Placeholder for related files
  templateContent = templateContent.replace(/\[Related code\/document paths\]/g, ''); // Placeholder for related files
  templateContent = templateContent.replace(/\[Related code paths\]/g, ''); // Placeholder for related files


  // Ensure output directory exists
  const outputDir = path.dirname(outputPath);
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }

  fs.writeFileSync(outputPath, templateContent);
  console.log(`Generated template for "${templateType}" at "${outputPath}"`);
}

// Command line arguments: node generate-doc-template.js <templateType> <outputPath> [title]
const args = process.argv.slice(2);

if (args.length < 2) {
  console.error('Usage: node scripts/generate-doc-template.js <templateType> <outputPath> [title]');
  process.exit(1);
}

const templateType = args[0];
const outputPath = args[1];
const title = args[2];

generateTemplate(templateType, outputPath, title);
