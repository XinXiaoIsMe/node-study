import { createServer } from 'node:net';

const html = `<h1>TCP Server</h1>`;

const responseHeader = [
  'HTTP/1.1 200 OK',
  'Content-Type: text/html',
  `Content-Length: ${html.length}`,
  'Server: Nodejs',
  '\r\n',
  html,
];

const server = createServer((socket) => {
  socket.on('data', (data) => {
    const reg = /GET/;
    if (reg.test(data.toString())) {
      socket.write(responseHeader.join('\r\n'));
      socket.end();
    }
  });

  socket.on('connect', () => {
    // eslint-disable-next-line no-console
    console.log('connected');
  });

  socket.on('close', () => {
    // eslint-disable-next-line no-console
    console.log('closed');
  });

  socket.on('end', () => {
    // eslint-disable-next-line no-console
    console.log('end');
  });
});

server.listen(3000, () => {
  // eslint-disable-next-line no-console
  console.log('Server is running on 3000...');
});
