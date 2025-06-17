const express = require('express');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware to parse form data
app.use(express.urlencoded({ extended: true }));

// Serve homepage with the form
app.get('/', (req, res) => {
  res.send(`
    <html>
    <head><title>URL Scrambler</title></head>
    <body>
      <h1>Enter a URL to scramble</h1>
      <form method="POST" action="/scramble">
        <input type="url" name="url" placeholder="Enter full URL" required style="width: 300px;">
        <button type="submit">Scramble</button>
      </form>
    </body>
    </html>
  `);
});

// Handle form submission
app.post('/scramble', (req, res) => {
  const originalUrl = req.body.url;
  if (!originalUrl) {
    return res.send('Please enter a URL.');
  }

  try {
    new URL(originalUrl); // Validate URL format
  } catch {
    return res.send('Invalid URL format.');
  }

  // Base64 encode the URL
  const encodedUrl = Buffer.from(originalUrl).toString('base64');

  // Construct the scrambled redirect link (adjust hostname for deployment)
  const redirectUrl = `${req.protocol}://${req.get('host')}/redirect?url=${encodedUrl}`;

  // Show the scrambled link to the user
  res.send(`
    <html>
    <head><title>Scrambled Link</title></head>
    <body>
      <p>Original URL: <a href="${originalUrl}" target="_blank">${originalUrl}</a></p>
      <p>Scrambled redirect link:</p>
      <p><a href="${redirectUrl}" target="_blank">${redirectUrl}</a></p>
      <p><a href="/">Scramble another URL</a></p>
    </body>
    </html>
  `);
});

// Redirect handler: decode and redirect
app.get('/redirect', (req, res) => {
  const encodedUrl = req.query.url;
  if (!encodedUrl) {
    return res.status(400).send('Missing URL parameter.');
  }

  let decodedUrl;
  try {
    decodedUrl = Buffer.from(encodedUrl, 'base64').toString('utf-8');
  } catch {
    return res.status(400).send('Invalid URL encoding.');
  }

  // Basic validation to avoid open redirect abuse
  try {
    const urlObj = new URL(decodedUrl);
    if (!['http:', 'https:'].includes(urlObj.protocol)) {
      return res.status(400).send('Invalid URL protocol.');
    }
  } catch {
    return res.status(400).send('Invalid URL.');
  }

  // Redirect to decoded URL
  res.redirect(decodedUrl);
});

// Start server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
