const express = require('express');
const app = express();
const PORT = process.env.PORT || 3000;

// Redirect route
app.get('/redirect', (req, res) => {
  const encodedUrl = req.query.url;
  if (!encodedUrl) return res.status(400).send('Missing URL');

  let decodedUrl;
  try {
    decodedUrl = Buffer.from(encodedUrl, 'base64').toString('utf-8');
  } catch {
    return res.status(400).send('Invalid URL encoding');
  }

  // Basic validation to prevent open redirect abuse
  try {
    const urlObj = new URL(decodedUrl);
    if (!['http:', 'https:'].includes(urlObj.protocol)) {
      return res.status(400).send('Invalid URL protocol');
    }
  } catch {
    return res.status(400).send('Invalid URL');
  }

  res.redirect(decodedUrl);
});

// Serve frontend static files
app.use(express.static('../frontend'));

app.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`);
});
