const fs = require('fs');
const path = require('path');

const chartMigration = {
  analytics: {
    'AnalyticsDashboard.js': [
      {
        from: "import { Bar } from 'react-chartjs-2';",
        to: "import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from 'recharts';",
      },
      // Add more chart conversions here as needed
    ],
  },
};

const migrateCharts = () => {
  for (const feature in chartMigration) {
    const filesToMigrate = chartMigration[feature];
    for (const file in filesToMigrate) {
      const filePath = path.join(__dirname, '..', 'client', 'src', 'features', feature, 'components', 'dashboard', file); // Adjust path as needed
      let fileContent = fs.readFileSync(filePath, 'utf8');

      const conversions = filesToMigulate[file];
      for (const conversion of conversions) {
        fileContent = fileContent.replace(conversion.from, conversion.to);
      }

      fs.writeFileSync(filePath, fileContent, 'utf8');
      console.log(`Migrated charts in ${file}`);
    }
  }
};

migrateCharts();
