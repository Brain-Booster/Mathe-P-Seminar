const http = require('http');

// Create a simple HTTP server
const server = http.createServer((req, res) => {
  res.writeHead(200, { 'Content-Type': 'text/html' });
  res.end('<html><body><h1>Test Server Running!</h1><p>The server is working on port 33355</p></body></html>');
});

// Listen on port 33355
server.listen(33355, '0.0.0.0', () => {
  console.log('Server running at http://localhost:33355/');
}); 