const http = require('http');
const fs = require('fs');
const path = require('path');

const PORT = process.env.PORT || 3000;

const MIME_TYPES = {
  '.html': 'text/html',
  '.css': 'text/css',
  '.js': 'text/javascript',
  '.json': 'application/json',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.gif': 'image/gif',
  '.svg': 'image/svg+xml',
  '.csv': 'text/csv',
  '.ico': 'image/x-icon'
};

const server = http.createServer((req, res) => {
  // CORS & Security headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  let reqPath = req.url === '/' ? '/index.html' : req.url.split('?')[0];
  let filePath = path.join(__dirname, reqPath);
  let extname = path.extname(filePath).toLowerCase();
  let contentType = MIME_TYPES[extname] || 'application/octet-stream';

  fs.readFile(filePath, (err, content) => {
    if (err) {
      if (err.code === 'ENOENT') {
        // Fallback to index.html for SPA routing
        fs.readFile(path.join(__dirname, 'index.html'), (error, indexContent) => {
          if (error) {
            res.writeHead(500);
            res.end(`Error loading index.html: ${error.code}`);
          } else {
            res.writeHead(200, { 'Content-Type': 'text/html' });
            res.end(indexContent, 'utf-8');
          }
        });
      } else {
        res.writeHead(500);
        res.end(`Server Error: ${err.code}`);
      }
    } else {
      res.writeHead(200, { 'Content-Type': contentType });
      res.end(content, 'utf-8');
    }
  });
});

server.listen(PORT, () => {
  console.log(`=======================================================`);
  console.log(`🚀 YenFind Server is live at http://localhost:${PORT}`);
  console.log(`✨ Vibe Coded by Sanjeev Karthikeya (@ask_invictus)`);
  console.log(`=======================================================`);
});
