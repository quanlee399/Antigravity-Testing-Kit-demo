import { htmlReport } from 'https://raw.githubusercontent.com/benc-uk/k6-reporter/main/dist/bundle.js';
import { textSummary } from 'https://jslib.k6.io/k6-summary/0.0.1/index.js';

/**
 * Generates both HTML Dashboard and Markdown Summary reports for k6 tests
 * @param {Object} data - k6 summary data object
 * @param {string} title - Report title
 * @returns {Object} Output file mappings for k6 handleSummary
 */
export function generateK6Report(data, title = 'k6 Performance Test Report') {
  let md = `# 📊 ${title}\n\n`;

  const httpDuration = data.metrics && data.metrics.http_req_duration ? data.metrics.http_req_duration.values : {};
  const httpFailed = data.metrics && data.metrics.http_req_failed ? data.metrics.http_req_failed.values : {};
  const httpReqs = data.metrics && data.metrics.http_reqs ? data.metrics.http_reqs.values : {};
  const checks = data.metrics && data.metrics.checks ? data.metrics.checks.values : {};

  const totalReqs = httpReqs.count || 0;
  const failRate = httpFailed.rate !== undefined ? (httpFailed.rate * 100).toFixed(2) : '0.00';
  const p95 = httpDuration['p(95)'] !== undefined ? httpDuration['p(95)'].toFixed(2) + ' ms' : 'N/A';
  const avg = httpDuration.avg !== undefined ? httpDuration.avg.toFixed(2) + ' ms' : 'N/A';
  const checkRate = checks.rate !== undefined ? (checks.rate * 100).toFixed(2) : '0.00';

  md += `## 📈 Executive Summary\n\n`;
  md += `| Metric | Value | Status |\n`;
  md += `| :--- | :--- | :---: |\n`;
  md += `| **Total HTTP Requests** | \`${totalReqs}\` | ℹ️ |\n`;
  md += `| **Failed HTTP Requests** | \`${failRate}%\` | ${parseFloat(failRate) === 0 ? '✅ PASS' : (parseFloat(failRate) < 15 ? '⚠️ WARN' : '❌ FAIL')} |\n`;
  md += `| **Checks Success Rate** | \`${checkRate}%\` | ${parseFloat(checkRate) >= 80 ? '✅ PASS' : '❌ FAIL'} |\n`;
  md += `| **Avg Latency** | \`${avg}\` | ⏱️ |\n`;
  md += `| **p95 Latency** | \`${p95}\` | ⏱️ |\n\n`;

  md += `## 🔍 Detailed Checks & Failure Diagnostics\n\n`;
  md += `| Scenario / Check Name | Passes | Fails | Success Rate | Status |\n`;
  md += `| :--- | :---: | :---: | :---: | :---: |\n`;

  if (data.root_group && data.root_group.checks) {
    for (const check of data.root_group.checks) {
      const total = check.passes + check.fails;
      const rate = total > 0 ? ((check.passes / total) * 100).toFixed(1) + '%' : 'N/A';
      const status = check.fails === 0 ? '✅ PASS' : '❌ FAIL';
      md += `| **[Root]** ${check.name} | ${check.passes} | ${check.fails} | ${rate} | ${status} |\n`;
    }
  }

  function processGroup(group, prefix = '') {
    const currentName = prefix ? `${prefix} ➔ ${group.name}` : group.name;
    if (group.checks && group.checks.length > 0) {
      for (const check of group.checks) {
        const total = check.passes + check.fails;
        const rate = total > 0 ? ((check.passes / total) * 100).toFixed(1) + '%' : 'N/A';
        const status = check.fails === 0 ? '✅ PASS' : '❌ FAIL';
        md += `| \`${currentName}\`<br>${check.name} | ${check.passes} | ${check.fails} | ${rate} | ${status} |\n`;
      }
    }
    if (group.groups) {
      for (const subGroup of group.groups) {
        processGroup(subGroup, currentName);
      }
    }
  }

  if (data.root_group && data.root_group.groups) {
    for (const group of data.root_group.groups) {
      processGroup(group);
    }
  }

  return {
    'k6/results/k6-report.html': htmlReport(data, { title }),
    'k6/results/summary.md': md,
    'stdout': textSummary(data, { indent: ' ', enableColors: true }),
  };
}
