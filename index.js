
const http = require('http');
const https = require('https');
const url = require('url');
const cheerio = require('cheerio');

const PORT = process.env.PORT || 3000;
const baseurl = 'http://localhost:3000/?url='; // change this URL on server

const server = http.createServer((req, res) => {
    const parsedUrl = url.parse(req.url, true);
    const targetUrl = parsedUrl.query.url;

    if (!targetUrl) {
        res.statusCode = 400;
        res.end('Please provide a valid target URL. Example: ?url=https://example.com');
        return;
    }

    try {
        // Validate the URL
        const validatedUrl = new URL(targetUrl);

        console.log('Fetching URL:', validatedUrl.href);

        const protocol = validatedUrl.protocol === 'https:' ? https : http;

        const request = protocol.request(validatedUrl.href, (targetRes) => {
            if (targetRes.statusCode >= 300 && targetRes.statusCode < 400 && targetRes.headers.location) {
                // Handle redirect
                const redirectUrl = new URL(targetRes.headers.location, validatedUrl.href).href;
                console.log('Redirecting to:', redirectUrl);

                // Make a new request to the redirected URL
                protocol.get(redirectUrl, (redirectRes) => {
                    handleResponse(redirectRes, res);
                }).on('error', (err) => {
                    console.error('Error fetching redirected URL:', err);
                    res.statusCode = 500;
                    res.end('Error fetching redirected URL.');
                });
            } else {
                handleResponse(targetRes, res);
            }
        });

        request.on('error', (err) => {
            console.error('Error fetching URL:', err);
            res.statusCode = 500;
            res.end('Error fetching URL.');
        });

        request.end();
    } catch (error) {
        console.error('Invalid URL:', targetUrl);
        res.statusCode = 400;
        res.end('Invalid URL provided.');
    }
});

function handleResponse(targetRes, res) {
    let html = '';

    targetRes.on('data', (chunk) => {
        html += chunk;
    });

    targetRes.on('end', () => {
        // Load the HTML into Cheerio
        const $ = cheerio.load(html);

        // Manipulate the DOM using Cheerio methods
        $('a').each((index, element) => {
            const originalHref = $(element).attr('href');
            if (originalHref) {
                $(element).attr('href', `${baseurl}${originalHref}`);
                $(element).attr('onclick', `fetchUrl('${originalHref}')`);
            }
        });

        // Get the modified HTML
        const modifiedHtml = $.html();

        // Send the modified HTML back to the client
        res.writeHead(targetRes.statusCode, targetRes.headers);
        res.end(modifiedHtml);
    });
}

server.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
