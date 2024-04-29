const http = require('http');
const url = require('url');
const request = require('request');

const PORT = process.env.PORT || 3000;

const server = http.createServer((req, res) => {
    const parsedUrl = url.parse(req.url);
    const targetUrl = parsedUrl.query ? parsedUrl.query.substr(4) : '';

    if (!targetUrl) {
        res.statusCode = 400;
        res.end('Please provide a target URL.');
        return;
    }

    console.log('Proxying request to:', targetUrl);

    const options = {
        url: targetUrl,
        headers: req.headers,
        method: req.method
    };

    request(options, (error, response, body) => {
        if (error) {
            console.error('Error occurred while fetching the target URL:', error);
            res.statusCode = 500;
            res.end('Error occurred while fetching the target URL.');
            return;
        }

        console.log('Received response from target URL:', response.statusCode);

        res.writeHead(response.statusCode, response.headers);
        res.end(body);
    });
});

server.listen(PORT, () => {
    console.log(`Proxy server is running on port ${PORT}`);
});
