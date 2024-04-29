const http = require('http');
const https = require('https');
const url = require('url');
const cheerio = require('cheerio');

const PORT = process.env.PORT || 3000;

const server = http.createServer((req, res) => {
    const parsedUrl = url.parse(req.url, true);
    const targetUrl = parsedUrl.query.url;

    if (!targetUrl) {
        res.statusCode = 400;
        res.end('Please provide a target URL.');
        return;
    }

    console.log('Fetching URL:', targetUrl);

    const protocol = targetUrl.startsWith('https') ? https : http;

    protocol.get(targetUrl, (targetRes) => {
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
                // Set the href attribute to #
                $(element).attr('href', '#');
                // Add onclick attribute to fetch the URL via AJAX
                $(element).attr('onclick', `fetchUrl('${originalHref}')`);
            });

            // Get the modified HTML
            const modifiedHtml = $.html();

            // Send the modified HTML back to the client
            res.writeHead(targetRes.statusCode, targetRes.headers);
            res.end(modifiedHtml);
        });
    }).on('error', (err) => {
        console.error('Error fetching URL:', err);
        res.statusCode = 500;
        res.end('Error fetching URL.');
    });
});

server.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
