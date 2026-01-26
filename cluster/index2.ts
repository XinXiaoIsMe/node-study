import http from 'node:http';

http.createServer((req, res) => {
  res.writeHead(200);
  res.end('cluster is running');
}).listen(6000, () => {
  // eslint-disable-next-line no-console
  console.log('http://127.0.0.1:6000');
});
