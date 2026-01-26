import cluster from 'node:cluster';
import http from 'node:http';
import os from 'node:os';

const cups = os.cpus().length;

// 主进程
if (cluster.isPrimary) {
  for (let i = 0; i < cups; i++) {
    // 创建子进程
    cluster.fork();
  }
}
else {
  http.createServer((_req, res) => {
    res.writeHead(200);
    res.end('cluster is running');
  }).listen(3000, () => {
    // eslint-disable-next-line no-console
    console.log('http://127.0.0.1:3000');
  });
}
