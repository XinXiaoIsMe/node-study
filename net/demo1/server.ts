import { createServer } from 'node:net';

const server = createServer((socket) => {
  setInterval(() => {
    socket.write('ok');
  }, 1000);
});

server.listen(3000, () => {
  // eslint-disable-next-line no-console
  console.log('Server is running on 3000...');
});
