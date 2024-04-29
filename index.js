const http = require('http');
const url = require('url');

// Create a proxy server
const proxy = http.createServer((req, res) => {
  // Log the incoming request
  console.log(`Proxying request for: ${req.url}`);

  // Parse the user's request URL
  const userUrl = url.parse(req.url);

  // Forward the request to the target website
  const options = {
    hostname: userUrl.hostname,
    port: userUrl.port || 80, // Default port to 80 if not specified
    path: userUrl.path,
    method: req.method,
    headers: req.headers
  };

  const proxyReq = http.request(options, (proxyRes) => {
    // Forward the response from the target website back to the client
    res.writeHead(proxyRes.statusCode, proxyRes.headers);
    proxyRes.pipe(res, {
      end: true
    });
  });

  // Handle errors
  proxyReq.on('error', (err) => {
    console.error('Proxy request error:', err);
    res.writeHead(500, { 'Content-Type': 'text/plain' });
    res.end('Proxy request failed');
  });

  // Pipe the request body (if any) to the target website
  req.pipe(proxyReq, {
    end: true
  });
});

// Start listening on a specific port
const PORT = process.env.PORT || 8080;
proxy.listen(PORT, () => {
  console.log(`Proxy server listening on port ${PORT}`);
});
