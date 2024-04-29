const http = require('http');
const httpProxy = require('http-proxy');
const url = require('url');

// Create a proxy server
const proxy = httpProxy.createProxyServer({});

// Handle proxy server errors
proxy.on('error', (err, req, res) => {
  console.error('Proxy error:', err);
  res.writeHead(500, {
    'Content-Type': 'text/plain'
  });
  res.end('Proxy error');
});

// Create an HTTP server
const server = http.createServer((req, res) => {
  // Log the incoming request
  console.log(`Proxying request for: ${req.url}`);

  // Parse the user's request URL
  const userUrl = req.url.startsWith('/') ? url.parse(req.url.substring(1)) : url.parse(req.url);

  // If the URL is relative, respond with an error
  if (!userUrl.host) {
    console.error('Invalid URL:', req.url);
    res.writeHead(400, { 'Content-Type': 'text/plain' });
    res.end('Invalid URL');
    return;
  }

  // Forward the request to the target website
  proxy.web(req, res, {
    target: userUrl.href // Forward to the requested URL
  });
});

// Start the HTTP server
const PORT = process.env.PORT || 8080;
server.listen(PORT, () => {
  console.log(`Reverse proxy server listening on port ${PORT}`);
});
