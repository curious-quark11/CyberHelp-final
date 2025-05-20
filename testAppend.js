const fs = require('fs');
const path = require('path');

const reportsFile = path.join(__dirname, 'reports.json');

let reports = JSON.parse(fs.readFileSync(reportsFile, 'utf8'));

reports.push({
  name: "Test manual",
  email: "manual@test.com",
  incident: "Manual test",
  screenshot: null,
  timestamp: new Date().toISOString()
});

fs.writeFileSync(reportsFile, JSON.stringify(reports, null, 2));

console.log('Manually appended report');
