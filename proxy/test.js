import http from 'node:http';

const server = http.createServer((req, res) => {
  res.setHeader('Content-type', 'application/json');
  res.end(JSON.stringify({
    code: 200,
    status: true,
    msg: 'Proxy success!',
    data: {
      msg: 'Proxy success!',
      url: req.url
    }
  }));
});

server.listen(8080, () => {
  console.log('Server is running on port 8080');
});