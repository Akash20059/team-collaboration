const app = require('../server/index.js');

module.exports = (req, res) => {
  // Vercel serverless strips the mounting path (e.g., /api) from req.url
  // We add it back so Express app.use('/api/...') routes match correctly!
  if (!req.url.startsWith('/api')) {
    req.url = '/api' + (req.url === '/' ? '' : req.url);
  }
  return app(req, res);
};
