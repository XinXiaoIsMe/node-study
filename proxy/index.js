import http from 'node:http';
import { parse } from 'node:url';
import fs from 'node:fs';
import path from 'node:path';
import { createProxyMiddleware } from 'http-proxy-middleware';
import mime from 'mime';
import config from './config.js';

const server = http.createServer((req, res) => {
  const { pathname } = parse(req.url, true);
  const proxyList = Object.keys(config.proxy);
  // 设置代理
  for (const proxy of proxyList) {
    if (pathname.startsWith(proxy)) {
      createProxyMiddleware(config.proxy[proxy])(req, res);
      return;
    }
  }

  // 静态文件，直接读取，并设置缓存
  if (req.method === 'GET' && pathname.startsWith('/static')) {
    const filePath = path.join(process.cwd(), pathname);
    fs.readFile(filePath, (err, data) => {
      if (err) {
        res.writeHead(404, {
          'Content-Type': 'text/plain'
        });
        res.end('Not Found');
        return;
      }

      const mimeType = mime.getType(filePath); // 获取静态文件的mime type类型
      res.writeHead(200, {
        'Content-Type': mimeType, // 设置响应头为对应的MIME类型
        'Cache-Control': 'public, max-age=3600' // 设置缓存控制头
      });
      res.end(data);
    });
    return;
  }

  const html = fs.readFileSync('./index.html', 'utf-8');
  res.setHeader('Content-type', 'text/html');
  res.end(html);
});

server.listen(3000, () => {
  console.log('Server is running on port 3000');
});