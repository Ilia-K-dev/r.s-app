const { chromium } = require('playwright');
const lighthouse = require('lighthouse');

async function runPerformanceTest() {
  const browser = await chromium.launch();
  const context = await browser.newContext();
  const page = await context.newPage();
  
  // Measure First Contentful Paint
  await page.goto('http://localhost:3000');
  const performanceMetrics = await page.evaluate(() => {
    const perfEntries = performance.getEntries();
    return {
      fcp: perfEntries.find(e => e.name === 'first-contentful-paint')?.startTime,
      lcp: perfEntries.find(e => e.entryType === 'largest-contentful-paint')?.startTime,
    };
  });
  
  console.log('Performance Metrics:', performanceMetrics);
  await browser.close();
}

runPerformanceTest();

// **PAUSE**: Ask human to run "npm test" to verify testing setup
