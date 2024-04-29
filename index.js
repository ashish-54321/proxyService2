const http = require('http');

// Create a proxy server
const proxy = http.createServer((req, res) => {
  // Log the incoming request
  console.log(`Proxying request for: ${req.url}`);

  // Forward the request to the target website
  const options = {
    hostname: 'proxyservice2.onrender.com', // Replace with the target website hostname
    port: 80,
    path: req.url,
    method: req.method
    // Remove headers from user request and set the Host header
  //   headers: {
  //     'Host': 'proxyservice2.onrender.com'
  //   }
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
