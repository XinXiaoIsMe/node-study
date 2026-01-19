import type { ServerHttp2Stream } from 'node:http2';
import fs from 'node:fs';
import http2 from 'node:http2';

// 详情查看：https://juejin.cn/post/7352763226529447999
// http2目前只能在https中支持，因此需要启动https环境，首先运行以下命令生成证书：
// openssl genrsa -out server.key 1024
// openssl req -new -key server.key -out server.csr
// openssl x509 -req -in server.csr -out server.crt -signkey server.key -days 3650

const server = http2.createSecureServer({
  key: fs.readFileSync('server.key'),
  cert: fs.readFileSync('server.crt'),
});

server.on('stream', (stream) => {
  const serverStream = stream as ServerHttp2Stream;

  serverStream.respond({
    'content-type': 'text/html; charset=utf-8',
    ':status': 200,
  });
  serverStream.on('error', (err) => {
    // eslint-disable-next-line no-console
    console.log(err);
  });
  serverStream.end(`
      <h1>http2</h1>
    `);
});

server.listen(80, () => {
  // eslint-disable-next-line no-console
  console.log('server is running on port 80');
});
