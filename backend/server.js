const express = require('express');
const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.urlencoded({ extended: true }));

// Homepage form
app.get('/', (req, res) => {
  res.send(`
    <h1>URL Rewriter</h1>
    <form method="POST" action="/scramble">
      <input type="url" name="url" placeholder="Enter URL" required style="width:300px" />
      <button type="submit">Get Rewritten Link</button>
    </form>
  `);
});

// Handle form submission
app.post('/scramble', (req, res) => {
  const originalUrl = req.body.url;
  if (!originalUrl) return res.send("Please enter a URL.");

  // Validate URL format
  try {
    new URL(originalUrl);
  } catch {
    return res.send("Invalid URL format.");
  }

  const encodedUrl = Buffer.from(originalUrl).toString('base64');
  const rewrittenLink = `${req.protocol}://${req.get('host')}/redirect?url=${encodedUrl}`;

  res.send(`
    <p>Original URL: <a href="${originalUrl}" target="_blank">${originalUrl}</a></p>
    <p>Your rewritten link:</p>
    <a href="${rewrittenLink}">${rewrittenLink}</a>
    <p><a href="/">Rewrite another URL</a></p>
  `);
});

// The rewritten link page — show original URL and a clickable button/link
app.get('/redirect', (req, res) => {
  const encodedUrl = req.query.url;
  if (!encodedUrl) return res.status(400).send("Missing url parameter.");

  let originalUrl;
  try {
    originalUrl = Buffer.from(encodedUrl, 'base64').toString('utf-8');
    new URL(originalUrl); // validate
  } catch {
    return res.status(400).send("Invalid URL.");
  }

  res.send(`
    <h1>Rewritten URL Viewer</h1>
    <p>Original URL:</p>
    <a href="${originalUrl}" target="_blank">${originalUrl}</a>
    <p>
      <button onclick="window.open('${originalUrl}', '_blank')">Open Original URL</button>
    </p>
    <p><a href="/">Back to home</a></p>
  `);
});

app.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`);
});
