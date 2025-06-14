const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

const app = express();
const PORT = process.env.PORT || 3000; // Use the Render-provided port or default to 3000 locally

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));

// Ensure 'uploads' directory exists
const uploadDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir);
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadDir),
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    cb(null, file.fieldname + '-' + Date.now() + ext);
  }
});
const upload = multer({ storage });

app.post('/submit-report', upload.single('screenshot'), (req, res) => {
  const { name, email, incident } = req.body;
  const screenshot = req.file ? req.file.filename : null;
  const reportsFile = path.join(__dirname, 'reports.json');

  try {
    if (!fs.existsSync(reportsFile)) {
      fs.writeFileSync(reportsFile, '[]', 'utf8');
    }

    const data = fs.readFileSync(reportsFile, 'utf8');
    let reports = JSON.parse(data);

    reports.push({
      name,
      email,
      incident,
      screenshot,
      timestamp: new Date().toISOString()
    });

    fs.writeFileSync(reportsFile, JSON.stringify(reports, null, 2), 'utf8');

    console.log('Report saved:', { name, email, incident, screenshot });
    res.redirect('/thank-you.html');
  } catch (error) {
    console.error('Error saving report:', error);
    res.status(500).send('Server error');
  }
});

app.post('/submit-review', (req, res) => {
  const { name, feedback } = req.body;
  const reviewsFile = path.join(__dirname, 'reviews.json');

  try {
    if (!fs.existsSync(reviewsFile)) {
      fs.writeFileSync(reviewsFile, '[]', 'utf8');
    }

    const data = fs.readFileSync(reviewsFile, 'utf8');
    let reviews = JSON.parse(data);

    reviews.push({
      name,
      feedback,
      date: new Date().toISOString()
    });

    fs.writeFileSync(reviewsFile, JSON.stringify(reviews, null, 2), 'utf8');

    console.log('Review saved:', { name, feedback });
    res.redirect('/thank-you-review.html');
  } catch (error) {
    console.error('Error saving review:', error);
    res.status(500).send('Server error');
  }
});

// ✅ Correct listen() for Render:
app.listen(PORT, () => {
  console.log(` Server running on port ${PORT}`);
});
