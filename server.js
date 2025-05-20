const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

const app = express();
const PORT = 3000;

// Middleware to parse JSON and URL-encoded data
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve static files from public folder
app.use(express.static(path.join(__dirname, 'public')));

// Multer setup for screenshot uploads in report form
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    // Make sure uploads folder exists
    const uploadDir = path.join(__dirname, 'uploads');
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir);
    }
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    cb(null, file.fieldname + '-' + Date.now() + ext);
  }
});
const upload = multer({ storage });

// POST /submit-report - save report with screenshot if any
app.post('/submit-report', upload.single('screenshot'), (req, res) => {
  const { name, email, incident } = req.body;
  const screenshot = req.file ? req.file.filename : null;
  const reportsFile = path.join(__dirname, 'reports.json');

  try {
    // Ensure file exists
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

    // Sync write to guarantee completion
    fs.writeFileSync(reportsFile, JSON.stringify(reports, null, 2), 'utf8');

    console.log('Report saved:', { name, email, incident, screenshot });
    res.redirect('/thank-you.html');
  } catch (error) {
    console.error('Error saving report:', error);
    res.status(500).send('Server error');
  }
});

// POST /submit-review - save reviews to reviews.json
app.post('/submit-review', (req, res) => {
  const { name, feedback } = req.body;

  const reviewsFile = path.join(__dirname, 'reviews.json');

  if (!fs.existsSync(reviewsFile)) {
    fs.writeFileSync(reviewsFile, '[]', 'utf8');
  }

  fs.readFile(reviewsFile, 'utf8', (err, data) => {
    if (err) {
      console.error('Error reading reviews file:', err);
      return res.status(500).send('Server error');
    }

    let reviews = [];
    try {
      reviews = JSON.parse(data);
    } catch (parseErr) {
      console.error('Error parsing reviews:', parseErr);
      reviews = [];
    }

    reviews.push({ name, feedback, date: new Date().toISOString() });

    fs.writeFile(reviewsFile, JSON.stringify(reviews, null, 2), (writeErr) => {
      if (writeErr) {
        console.error('Error writing review:', writeErr);
        return res.status(500).send('Server error');
      }

      console.log('Review saved:', { name, feedback });
      res.redirect('/thank-you-review.html');
    });
  });
});

app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});
