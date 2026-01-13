import { createServer } from 'node:http';
import cors from 'cors';
import express from 'express';
import { Server } from 'socket.io';

interface Room {
  name: string;
  room: string;
  id: string;
}

type GroupList = Record<string, Room[]>;

const app = express();
const server = createServer(app);
const io = new Server(server, {
  cors: {
    origin: '*',
  },
});
const groupList: GroupList = {};

app.use(cors());

io.on('connection', (socket) => {
  socket.on('join', ({ name, room }) => {
    if (!name || !room) {
      socket.emit('message', { user: '系统', text: '用户名和房间号不能为空' });
      return;
    }
    // 订阅一个房间，方便后续广播信息到指定房间
    socket.join(room);
    const id = socket.id;
    if (groupList[room]) {
      groupList[room].push({
        name,
        room,
        id,
      });
    }
    else {
      groupList[room] = [{
        name,
        room,
        id,
      }];
    }
    socket.emit('message', { user: '管理员', text: `${name}进入了房间` });
    socket.to(room).emit('message', { user: '管理员', text: `${name}进入了房间` });
    io.emit('groupList', groupList);
  });

  socket.on('message', ({ room, text, user }) => {
    socket.to(room).emit('message', {
      text,
      user,
    });
  });

  // 断开链接内置事件
  socket.on('disconnect', () => {
    Object.keys(groupList).forEach((key) => {
      const leval = groupList[key].find(item => item.id === socket.id);
      if (leval) {
        socket.broadcast.to(leval.room).emit('message', { user: '管理员', text: `${leval.name}离开了房间` });
      }
      groupList[key] = groupList[key].filter(item => item.id !== socket.id);
    });
    socket.broadcast.emit('groupList', groupList);
  });
});

server.listen(3000, () => {
  // eslint-disable-next-line no-console
  console.log('server is running on 3000...');
});
