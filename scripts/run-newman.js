const newman = require('newman');
const path = require('path');
const fs = require('fs');

const reportsDir = path.join(__dirname, '..', 'newman-reports');
if (!fs.existsSync(reportsDir)) {
  fs.mkdirSync(reportsDir, { recursive: true });
}

// Write initial placeholder index.html & summary.md so directory is never empty
const initialIndexHtml = `<!DOCTYPE html>
<html>
<head><title>API Testing Dashboard</title></head>
<body style="font-family: sans-serif; background: #0f172a; color: white; padding: 2rem;">
  <h1>🧪 Newman API Testing Dashboard</h1>
  <p>Test suite execution is starting/in progress...</p>
</body>
</html>`;
fs.writeFileSync(path.join(reportsDir, 'index.html'), initialIndexHtml, 'utf8');
fs.writeFileSync(path.join(reportsDir, 'summary.md'), '# 🧪 Newman API Test Automation Dashboard\n\nExecution starting...\n', 'utf8');

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
    collection: path.join(__dirname, '..', 'Postman JSON import files', 'ReqRes_API_Postman_Collection.json'),
    environment: path.join(__dirname, '..', 'Postman JSON import files', 'environments', 'reqres.env.json'),
    envVars: process.env.REQRES_API_KEY ? [{ key: 'apiKey', value: process.env.REQRES_API_KEY }] : []
  },
  {
    name: 'Restful Booker API',
    slug: 'restful-booker',
    collection: path.join(__dirname, '..', 'Postman JSON import files', 'Restful_Booker_Postman_Collection.json'),
    environment: path.join(__dirname, '..', 'Postman JSON import files', 'environments', 'restful_booker.env.json'),
    envVars: []
  },
  {
    name: 'Swagger Petstore API',
    slug: 'swagger-petstore',
    collection: path.join(__dirname, '..', 'Postman JSON import files', 'Swagger_Petstore_Postman_Collection.json'),
    environment: path.join(__dirname, '..', 'Postman JSON import files', 'environments', 'swagger_petstore.env.json'),
    envVars: []
  },
  {
    name: 'Todoist API',
    slug: 'todoist',
    collection: path.join(__dirname, '..', 'Postman JSON import files', 'Todoist_API_Postman_Collection.json'),
    environment: path.join(__dirname, '..', 'Postman JSON import files', 'environments', 'todoist.env.json'),
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
  console.log(`📁 Collection Path: ${suite.collection}`);
  console.log(`📄 Environment Path: ${suite.environment}`);
  console.log(`==================================================`);

  if (!fs.existsSync(suite.collection)) {
    console.error(`❌ Collection file NOT FOUND: ${suite.collection}`);
    results.push({
      name: suite.name,
      slug: suite.slug,
      status: 'FAILED',
      totalRequests: 0,
      failedRequests: 1,
      totalAssertions: 0,
      failedAssertions: 1,
      reportPath: reportPath,
      error: `Collection file not found at ${suite.collection}`
    });
    suiteIndex++;
    runNextSuite();
    return;
  }

  if (!fs.existsSync(suite.environment)) {
    console.error(`⚠️ Environment file NOT FOUND: ${suite.environment}`);
  }

  try {
    newman.run({
      collection: suite.collection,
      environment: fs.existsSync(suite.environment) ? suite.environment : undefined,
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
        console.error(`❌ Error executing suite ${suite.name}:`, err.message || err);
        results.push({
          name: suite.name,
          slug: suite.slug,
          status: 'FAILED',
          totalRequests: 0,
          failedRequests: 1,
          totalAssertions: 0,
          failedAssertions: 1,
          reportPath: reportPath,
          error: err.message || String(err)
        });
      } else {
        const stats = summary.run ? summary.run.stats : { requests: {}, assertions: {} };
        const failedRequests = (stats.requests && stats.requests.failed) || 0;
        const failedAssertions = (stats.assertions && stats.assertions.failed) || 0;
        const totalReqs = (stats.requests && stats.requests.total) || 0;
        const totalAsserts = (stats.assertions && stats.assertions.total) || 0;
        const isPass = failedRequests === 0 && failedAssertions === 0;

        results.push({
          name: suite.name,
          slug: suite.slug,
          status: isPass ? 'PASSED' : 'FAILED',
          totalRequests: totalReqs,
          failedRequests: failedRequests,
          totalAssertions: totalAsserts,
          failedAssertions: failedAssertions,
          reportPath: reportPath
        });
      }

      suiteIndex++;
      runNextSuite();
    });
  } catch (runErr) {
    console.error(`💥 Fatal Exception running suite ${suite.name}:`, runErr);
    results.push({
      name: suite.name,
      slug: suite.slug,
      status: 'FAILED',
      totalRequests: 0,
      failedRequests: 1,
      totalAssertions: 0,
      failedAssertions: 1,
      reportPath: reportPath,
      error: runErr.message
    });
    suiteIndex++;
    runNextSuite();
  }
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

  let pagesBaseUrl = null;
  if (process.env.GITHUB_REPOSITORY) {
    const [owner, repo] = process.env.GITHUB_REPOSITORY.split('/');
    pagesBaseUrl = `https://${owner}.github.io/${repo}`;
  }

  const markdownLines = [
    '# 🧪 Newman API Test Automation Dashboard',
    '',
    `**Execution Date**: ${new Date().toUTCString()}`,
    ''
  ];

  if (pagesBaseUrl) {
    markdownLines.push(`🌐 **Live HTML Reports Dashboard**: [View GitHub Pages Dashboard](${pagesBaseUrl})`);
    markdownLines.push('');
  }

  markdownLines.push('| Suite Name | Status | Requests (Total/Failed) | Assertions (Total/Failed) | Interactive Report |');
  markdownLines.push('| :--- | :---: | :---: | :---: | :--- |');

  results.forEach(res => {
    totalRequestsAll += res.totalRequests;
    failedRequestsAll += res.failedRequests;
    totalAssertionsAll += res.totalAssertions;
    failedAssertionsAll += res.failedAssertions;

    if (res.status === 'FAILED') {
      hasFailures = true;
    }

    const badge = res.status === 'PASSED' ? '✅ PASSED' : '❌ FAILED';
    const reportFilename = `${res.slug}-report.html`;
    
    let reportLink = `[Download Artifacts / Local](./${reportFilename})`;
    if (pagesBaseUrl) {
      reportLink = `[🔗 Open Live Report](${pagesBaseUrl}/${reportFilename})`;
    }

    console.log(`${badge} | ${res.name.padEnd(22)} | Requests: ${res.totalRequests - res.failedRequests}/${res.totalRequests} | Assertions: ${res.totalAssertions - res.failedAssertions}/${res.totalAssertions}`);

    markdownLines.push(`| **${res.name}** | ${badge} | ${res.totalRequests} / ${res.failedRequests} | ${res.totalAssertions} / ${res.failedAssertions} | ${reportLink} |`);
  });

  markdownLines.push('');
  markdownLines.push(`### 📈 Total Execution Summary`);
  markdownLines.push(`- **Total Requests**: ${totalRequestsAll} (${failedRequestsAll} failed)`);
  markdownLines.push(`- **Total Assertions**: ${totalAssertionsAll} (${failedAssertionsAll} failed)`);
  markdownLines.push(`- **Final Status**: ${hasFailures ? '❌ FAILED' : '✅ PASSED'}`);
  markdownLines.push('');
  markdownLines.push(`> ℹ️ *Note: Download the \`newman-api-test-reports\` ZIP artifact or view live via GitHub Pages.*`);

  // Write summary markdown
  const summaryMarkdownPath = path.join(reportsDir, 'summary.md');
  fs.writeFileSync(summaryMarkdownPath, markdownLines.join('\n'), 'utf8');

  // Build index.html Dashboard for GitHub Pages
  const indexHtmlContent = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>API Testing Reports Dashboard</title>
  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;600;700&display=swap" rel="stylesheet">
  <style>
    :root {
      --bg-color: #0f172a;
      --card-bg: #1e293b;
      --border-color: #334155;
      --text-main: #f8fafc;
      --text-muted: #94a3b8;
      --accent-pass: #22c55e;
      --accent-fail: #ef4444;
      --accent-blue: #3b82f6;
    }
    body {
      font-family: 'Inter', sans-serif;
      background-color: var(--bg-color);
      color: var(--text-main);
      margin: 0;
      padding: 2rem;
    }
    .container {
      max-width: 1100px;
      margin: 0 auto;
    }
    header {
      margin-bottom: 2rem;
      border-bottom: 1px solid var(--border-color);
      padding-bottom: 1.5rem;
    }
    h1 {
      font-size: 2rem;
      margin: 0 0 0.5rem 0;
      color: #ffffff;
    }
    .meta {
      color: var(--text-muted);
      font-size: 0.9rem;
    }
    .stats-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
      gap: 1.5rem;
      margin-bottom: 2.5rem;
    }
    .stat-card {
      background: var(--card-bg);
      border: 1px solid var(--border-color);
      border-radius: 12px;
      padding: 1.5rem;
    }
    .stat-card .label {
      color: var(--text-muted);
      font-size: 0.85rem;
      text-transform: uppercase;
      letter-spacing: 0.05em;
    }
    .stat-card .value {
      font-size: 1.8rem;
      font-weight: 700;
      margin-top: 0.5rem;
    }
    .suite-card {
      background: var(--card-bg);
      border: 1px solid var(--border-color);
      border-radius: 12px;
      padding: 1.5rem;
      margin-bottom: 1rem;
      display: flex;
      justify-content: space-between;
      align-items: center;
      transition: transform 0.2s ease, border-color 0.2s ease;
    }
    .suite-card:hover {
      transform: translateY(-2px);
      border-color: var(--accent-blue);
    }
    .suite-info h3 {
      margin: 0 0 0.4rem 0;
      font-size: 1.2rem;
    }
    .suite-metrics {
      font-size: 0.9rem;
      color: var(--text-muted);
    }
    .badge {
      padding: 0.35rem 0.8rem;
      border-radius: 9999px;
      font-weight: 600;
      font-size: 0.8rem;
      display: inline-block;
    }
    .badge-pass { background: rgba(34, 197, 94, 0.2); color: var(--accent-pass); }
    .badge-fail { background: rgba(239, 68, 68, 0.2); color: var(--accent-fail); }
    .btn {
      background: var(--accent-blue);
      color: #ffffff;
      padding: 0.6rem 1.2rem;
      border-radius: 8px;
      text-decoration: none;
      font-weight: 600;
      font-size: 0.9rem;
      transition: background 0.2s;
    }
    .btn:hover {
      background: #2563eb;
    }
  </style>
</head>
<body>
  <div class="container">
    <header>
      <h1>🧪 Newman API Test Automation Dashboard</h1>
      <div class="meta">Execution Date: ${new Date().toUTCString()} | Status: <strong>${hasFailures ? '❌ FAILED' : '✅ PASSED'}</strong></div>
    </header>

    <div class="stats-grid">
      <div class="stat-card">
        <div class="label">Total Test Suites</div>
        <div class="value">${suites.length}</div>
      </div>
      <div class="stat-card">
        <div class="label">Total Requests</div>
        <div class="value">${totalRequestsAll}</div>
      </div>
      <div class="stat-card">
        <div class="label">Passed Assertions</div>
        <div class="value" style="color: var(--accent-pass)">${totalAssertionsAll - failedAssertionsAll}</div>
      </div>
      <div class="stat-card">
        <div class="label">Failed Assertions</div>
        <div class="value" style="color: ${failedAssertionsAll > 0 ? 'var(--accent-fail)' : 'var(--text-muted)'}">${failedAssertionsAll}</div>
      </div>
    </div>

    <h2>API Test Suites</h2>
    ${results.map(r => `
      <div class="suite-card">
        <div class="suite-info">
          <h3>${r.name} <span class="badge ${r.status === 'PASSED' ? 'badge-pass' : 'badge-fail'}">${r.status}</span></h3>
          <div class="suite-metrics">
            Requests: ${r.totalRequests - r.failedRequests}/${r.totalRequests} | Assertions: ${r.totalAssertions - r.failedAssertions}/${r.totalAssertions}
          </div>
        </div>
        <a class="btn" href="./${r.slug}-report.html" target="_blank">View Detailed Report &rarr;</a>
      </div>
    `).join('')}
  </div>
</body>
</html>`;

  fs.writeFileSync(path.join(reportsDir, 'index.html'), indexHtmlContent, 'utf8');

  console.log('==================================================');
  console.log(`📄 Combined Summary Markdown saved to: ${summaryMarkdownPath}`);
  console.log(`🌐 Index Dashboard generated in: ${path.join(reportsDir, 'index.html')}`);
  console.log('==================================================\n');

  if (process.env.GITHUB_STEP_SUMMARY) {
    try {
      fs.appendFileSync(process.env.GITHUB_STEP_SUMMARY, markdownLines.join('\n') + '\n');
      console.log('✅ Updated GitHub Step Summary successfully.');
    } catch (e) {
      console.error('Failed to append to GITHUB_STEP_SUMMARY:', e);
    }
  }

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
