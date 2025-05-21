const fs = require('fs');
const path = require('path');

const reportsFile = path.join(__dirname, 'reports.json');
const reviewsFile = path.join(__dirname, 'reviews.json');

const backupDir = path.join(__dirname, 'backups');

// Create backups folder if it doesn't exist
if (!fs.existsSync(backupDir)) {
  fs.mkdirSync(backupDir);
}

// Generate timestamp string like 2025-05-20_14-30-00
const timestamp = new Date().toISOString().replace(/[:.]/g, '-');

// Backup reports.json
if (fs.existsSync(reportsFile)) {
  const backupReports = path.join(backupDir, `reports_backup_${timestamp}.json`);
  fs.copyFileSync(reportsFile, backupReports);
  console.log(`Backed up reports.json to ${backupReports}`);
} else {
  console.log('reports.json file not found!');
}

// Backup reviews.json
if (fs.existsSync(reviewsFile)) {
  const backupReviews = path.join(backupDir, `reviews_backup_${timestamp}.json`);
  fs.copyFileSync(reviewsFile, backupReviews);
  console.log(`Backed up reviews.json to ${backupReviews}`);
} else {
  console.log('reviews.json file not found!');
}
