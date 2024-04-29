const http = require('http');

// Create a proxy server
const proxy = http.createServer((req, res) => {
  // Log the incoming request
  console.log(`Proxying request for: ${req.url}`);

  // Forward the request to the target website
  const options = {
    hostname: '65ebc521-3876-4b05-ae2f-0783229f9e60-00-268y6qcut28j3.sisko.replit.dev', // Replace with the target website hostname
    port: 80,
    path: req.url,
    method: req.method,
    // Remove headers from user request and set the Host header
    headers: {
      'Host': '65ebc521-3876-4b05-ae2f-0783229f9e60-00-268y6qcut28j3.sisko.replit.dev'
    }
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
const PORT = process.env.PORT || 3000;
proxy.listen(PORT, () => {
  console.log(`Proxy server listening on port ${PORT}`);
});
