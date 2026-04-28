const http = require('http');
const fs = require('fs');
const path = require('path');

const port = 8080;
const rootDir = __dirname;

const mimeTypes = {
  '.html': 'text/html',
  '.js': 'text/javascript',
  '.css': 'text/css',
  '.json': 'application/json',
  '.png': 'image/png',
  '.jpg': 'image/jpg',
  '.jpeg': 'image/jpeg',
  '.gif': 'image/gif',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon',
  '.woff': 'application/font-woff',
  '.woff2': 'application/font-woff2',
  '.ttf': 'application/font-ttf',
  '.eot': 'application/vnd.ms-fontobject'
};

const server = http.createServer((req, res) => {
  let filePath = req.url === '/' ? '/index.html' : req.url;
  let fullPath = path.join(rootDir, filePath);

  fs.exists(fullPath, (exists) => {
    if (!exists) {
      res.writeHead(404, { 'Content-Type': 'text/html' });
      res.end('<h1>404 Not Found</h1>');
      return;
    }

    if (fs.statSync(fullPath).isDirectory()) {
      fullPath = path.join(fullPath, 'index.html');
    }

    fs.readFile(fullPath, (err, content) => {
      if (err) {
        res.writeHead(500);
        res.end('Error loading file');
      } else {
        const ext = path.extname(fullPath);
        const contentType = mimeTypes[ext] || 'text/plain';
        res.writeHead(200, { 'Content-Type': contentType });
        res.end(content, 'utf-8');
      }
    });
  });
});

server.listen(port, () => {
  console.log(`Frontend server running at http://localhost:${port}/`);
});
