import type { WebSocket } from 'ws';
import express from 'express';
import { WebSocketServer } from 'ws';

interface ConnectionCache {
  socket: WebSocket;
  fingerprint: string; // 浏览器指纹，常用于入库记录
}

interface WSData {
  action: string;
  id: number;
  fingerprint: string;
}

const app = express();
app.use(express.json());
app.use(express.urlencoded({
  extended: true,
}));

const server = app.listen(3000, () => {
  // eslint-disable-next-line no-console
  console.log('Server is running on port 3000...');
});
const wss = new WebSocketServer({ server });
const connections: Record<string, ConnectionCache> = {};

wss.on('connection', (ws: WebSocket) => {
  ws.on('message', (message: string) => {
    try {
      const { action, id, fingerprint }: WSData = JSON.parse(message);
      if (action === 'login') {
        // 判断是否已经登录过，如果登录过则提示用户并更新缓存，关闭上次登录时的ws实例
        if (Reflect.has(connections, id)) {
          connections[id].socket.send(JSON.stringify({
            action: 'logout',
            message: `你于${new Date().toLocaleString()}账号在别处登录`,
          }));
          connections[id].socket.close();
          connections[id].socket = ws;
        }
        else {
          // eslint-disable-next-line no-console
          console.log('首次登录');
          // 首次登录时记录浏览器指纹和ws实例，方便后续操作
          connections[id] = {
            socket: ws,
            fingerprint,
          };
        }
      }
    }
    catch (e) {
      // eslint-disable-next-line no-console
      console.log(e);
      ws.send(JSON.stringify({
        message: 'WebSocket报错，请查看传递数据是否格式正确',
      }));
    }
  });
});
