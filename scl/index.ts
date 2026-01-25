import cors from 'cors';
import express from 'express';
import jwt from 'jsonwebtoken';
import qrcode from 'qrcode';
import { getLocalIPv4 } from './utils';

interface User {
  token: string | null;
  time: number;
}

const app = express();
const ip = getLocalIPv4();
const port = 3000;
const userId = 1;
const user: Record<string, User> = {};
const EXPIRES_TIME = 30 * 1000; // 10s

enum QrCodeStatus {
  Auth = 0,
  UnAuth = 1,
  Timeout = 2,
}

app.use(express.json());
app.use(express.urlencoded({
  extended: true,
}));
app.use(cors());
app.use(express.static('client'));

app.get('/getQrCode', async (_req, res) => {
  user[userId] = {
    token: null,
    time: Date.now(),
  };
  const url = await qrcode.toDataURL(`http://${ip}:${port}/mandate.html?userId=${userId}`);
  res.send({
    url,
    code: '0',
    msg: '获取二维码成功！',
  });
});

app.post('/auth', (req, res) => {
  const userId = req.query.userId as string;
  const token = jwt.sign({
    userId,
  }, 'secret');
  user[userId].token = token;
  res.send({
    code: '0',
    msg: '授权成功！',
  });
});

app.get('/status', (req, res) => {
  const userId = req.query.userId as string;
  if (!user[userId]) {
    res.json({
      code: '0',
      msg: '请先扫码二维码',
      status: QrCodeStatus.Auth,
    });
    return;
  }

  const time = user[userId].time;
  const token = user[userId].token;
  if (Date.now() - time > EXPIRES_TIME) {
    res.send({
      code: '0',
      msg: '已过期',
      status: QrCodeStatus.Timeout,
    });
  }
  else if (token) {
    res.send({
      code: '0',
      msg: '已授权',
      status: QrCodeStatus.Auth,
    });
  }
  else {
    res.send({
      code: '0',
      msg: '未授权',
      status: QrCodeStatus.UnAuth,
    });
  }
});

app.listen(port, () => {
  // eslint-disable-next-line no-console
  console.log(`Server is running on port ${port}...`);
});
