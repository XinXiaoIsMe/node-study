const http = require('node:http');
const url = require('node:url');
const fs = require('node:fs');
const { createProxyMiddleware } = require('http-proxy-middleware');
const config = require('./config');

const server = http.createServer((req, res) => {
  const { pathname } = url.parse(req.url, true);
  const proxyList = Object.keys(config.proxy);
  for (const proxy of proxyList) {
    if (pathname.startsWith(proxy)) {
      createProxyMiddleware(config.proxy[proxy])(req, res);
      return;
    }
  }
  const html = fs.readFileSync('./index.html', 'utf-8');
  res.setHeader('Content-type', 'text/html');
  res.end(html);
});

server.listen(3000, () => {
  console.log('Server is running on port 3000');
});