import { createConnection } from 'node:net';

const client = createConnection({
  host: '127.0.0.1',
  port: 3000,
});

client.on('data', (data) => {
  // eslint-disable-next-line no-console
  console.log(data.toString()); // 持续接收server传递的数据，打印ok
});
