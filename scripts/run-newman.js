const newman = require('newman');
const path = require('path');
const fs = require('fs');

const reportsDir = path.join(__dirname, '..', 'newman-reports');
if (!fs.existsSync(reportsDir)) {
  fs.mkdirSync(reportsDir, { recursive: true });
}

// Read optional .env if available
try {
  require('dotenv').config();
} catch (e) {
  // dotenv optional
}

const suites = [
  {
    name: 'ReqRes API',
    slug: 'reqres',
    collection: path.join(__dirname, '../Postman JSON import files/ReqRes_API_Postman_Collection.json'),
    environment: path.join(__dirname, '../Postman JSON import files/environments/reqres.env.json'),
    envVars: process.env.REQRES_API_KEY ? [{ key: 'apiKey', value: process.env.REQRES_API_KEY }] : []
  },
  {
    name: 'Restful Booker API',
    slug: 'restful-booker',
    collection: path.join(__dirname, '../Postman JSON import files/Restful_Booker_Postman_Collection.json'),
    environment: path.join(__dirname, '../Postman JSON import files/environments/restful_booker.env.json'),
    envVars: []
  },
  {
    name: 'Swagger Petstore API',
    slug: 'swagger-petstore',
    collection: path.join(__dirname, '../Postman JSON import files/Swagger_Petstore_Postman_Collection.json'),
    environment: path.join(__dirname, '../Postman JSON import files/environments/swagger_petstore.env.json'),
    envVars: []
  },
  {
    name: 'Todoist API',
    slug: 'todoist',
    collection: path.join(__dirname, '../Postman JSON import files/Todoist_API_Postman_Collection.json'),
    environment: path.join(__dirname, '../Postman JSON import files/environments/todoist.env.json'),
    envVars: (process.env.TODOIST_BEARER_TOKEN || process.env.TODOIST_TOKEN) 
      ? [{ key: 'bearerToken', value: process.env.TODOIST_BEARER_TOKEN || process.env.TODOIST_TOKEN }] 
      : []
  }
];

const results = [];
let suiteIndex = 0;

function runNextSuite() {
  if (suiteIndex >= suites.length) {
    printSummaryAndExit();
    return;
  }

  const suite = suites[suiteIndex];
  const reportPath = path.join(reportsDir, `${suite.slug}-report.html`);

  console.log(`\n==================================================`);
  console.log(`🚀 Running Suite [${suiteIndex + 1}/${suites.length}]: ${suite.name}`);
  console.log(`==================================================`);

  newman.run({
    collection: suite.collection,
    environment: suite.environment,
    envVar: suite.envVars,
    reporters: ['cli', 'htmlextra'],
    reporter: {
      htmlextra: {
        export: reportPath,
        darkTheme: true,
        title: `${suite.name} - Test Report`,
        logs: true
      }
    }
  }, function (err, summary) {
    if (err) {
      console.error(`❌ Error executing suite ${suite.name}:`, err);
      results.push({
        name: suite.name,
        slug: suite.slug,
        status: 'FAILED',
        totalRequests: 0,
        failedRequests: 1,
        totalAssertions: 0,
        failedAssertions: 1,
        reportPath: reportPath,
        error: err.message
      });
    } else {
      const stats = summary.run.stats;
      const failedRequests = stats.requests.failed || 0;
      const failedAssertions = stats.assertions.failed || 0;
      const isPass = failedRequests === 0 && failedAssertions === 0;

      results.push({
        name: suite.name,
        slug: suite.slug,
        status: isPass ? 'PASSED' : 'FAILED',
        totalRequests: stats.requests.total || 0,
        failedRequests: failedRequests,
        totalAssertions: stats.assertions.total || 0,
        failedAssertions: failedAssertions,
        reportPath: reportPath
      });
    }

    suiteIndex++;
    runNextSuite();
  });
}

function printSummaryAndExit() {
  console.log('\n==================================================');
  console.log('📊 OVERALL NEWMAN TEST EXECUTION SUMMARY');
  console.log('==================================================');

  let totalRequestsAll = 0;
  let failedRequestsAll = 0;
  let totalAssertionsAll = 0;
  let failedAssertionsAll = 0;
  let hasFailures = false;

  const markdownLines = [
    '# 🧪 Newman API Test Automation Report',
    '',
    `**Execution Date**: ${new Date().toISOString()}`,
    '',
    '| Suite Name | Status | Requests (Total/Failed) | Assertions (Total/Failed) | HTML Report |',
    '| :--- | :---: | :---: | :---: | :--- |'
  ];

  results.forEach(res => {
    totalRequestsAll += res.totalRequests;
    failedRequestsAll += res.failedRequests;
    totalAssertionsAll += res.totalAssertions;
    failedAssertionsAll += res.failedAssertions;

    if (res.status === 'FAILED') {
      hasFailures = true;
    }

    const badge = res.status === 'PASSED' ? '✅ PASSED' : '❌ FAILED';
    console.log(`${badge} | ${res.name.padEnd(22)} | Requests: ${res.totalRequests - res.failedRequests}/${res.totalRequests} | Assertions: ${res.totalAssertions - res.failedAssertions}/${res.totalAssertions}`);
    
    const reportFilename = path.basename(res.reportPath);
    markdownLines.push(`| **${res.name}** | ${badge} | ${res.totalRequests} / ${res.failedRequests} | ${res.totalAssertions} / ${res.failedAssertions} | [View Report](./${reportFilename}) |`);
  });

  markdownLines.push('');
  markdownLines.push(`### 📈 Total Overview`);
  markdownLines.push(`- **Total Requests**: ${totalRequestsAll} (${failedRequestsAll} failed)`);
  markdownLines.push(`- **Total Assertions**: ${totalAssertionsAll} (${failedAssertionsAll} failed)`);
  markdownLines.push(`- **Final Status**: ${hasFailures ? '❌ FAILED' : '✅ PASSED'}`);

  const summaryMarkdownPath = path.join(reportsDir, 'summary.md');
  fs.writeFileSync(summaryMarkdownPath, markdownLines.join('\n'), 'utf8');

  console.log('==================================================');
  console.log(`📄 Combined Summary Markdown saved to: ${summaryMarkdownPath}`);
  console.log(`📁 HTML Reports generated in: ${reportsDir}`);
  console.log('==================================================\n');

  if (process.env.GITHUB_STEP_SUMMARY) {
    try {
      fs.appendFileSync(process.env.GITHUB_STEP_SUMMARY, markdownLines.join('\n') + '\n');
      console.log('✅ Updated GitHub Step Summary successfully.');
    } catch (e) {
      console.error('Failed to append to GITHUB_STEP_SUMMARY:', e);
    }
  }

  // Note: if user wants process to fail on test failure, set exit code
  if (hasFailures) {
    console.log('⚠️ Some API test suites contained failures.');
    process.exit(1);
  } else {
    console.log('🎉 All API test suites passed successfully!');
    process.exit(0);
  }
}

// Start runner
runNextSuite();
