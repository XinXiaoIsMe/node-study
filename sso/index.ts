import path from 'node:path';
import { fileURLToPath } from 'node:url';
import cors from 'cors';
import express from 'express';
import session from 'express-session';
import jwt from 'jsonwebtoken';

interface Application {
  secretKey: string;
  url: string;
  token: string;
}

const _dirname = path.dirname(fileURLToPath(import.meta.url));

const app = express();

const appToMapUrl: Record<string, Application> = {
  // A应用id
  'Rs6s2aHi': {
    url: 'http://localhost:5173', // 对应的应用地址
    secretKey: '%Y&*VGHJKLsjkas', // 对应的secretKey
    token: '', // token
  },
  // B应用id
  '9LQ8Y3mB': {
    url: 'http://localhost:5174', // 对应的应用地址
    secretKey: '%Y&*FRTYGUHJIOKL', // 对应的secretKey
    token: '', // token
  },
};

app.use(express.json());
app.use(express.urlencoded({
  extended: true,
}));
app.use(cors());
app.use(session({
  secret: '$%^&*()_+DFGHJKL',
  cookie: {
    maxAge: 1000 * 60 * 60 * 24 * 7, // 过期时间
  },
}));

app.get('/login', (req, res) => {
  if (req.session.username) {
    const appId: string = req.query.appId as string;
    const application = appToMapUrl[appId];
    const url = application.url;
    const token: string = application.token || genToken(appId);
    res.redirect(`${url}?token=${token}`);
    return;
  }

  res.sendFile(path.resolve(_dirname, './sso.html'));
});

app.get('/protectd', (req, res) => {
  const { appId, username } = req.query as Record<string, string>;
  const application = appToMapUrl[appId];
  if (!application) {
    res.status(400).json({
      message: '请先配置应用！',
    });
    return;
  }

  const { url } = application;
  const token = genToken(appId);
  req.session.username = username;
  application.token = token;
  res.redirect(`${url}?token=${token}`);
});

app.listen(3000, () => {
  // eslint-disable-next-line no-console
  console.log('Server is running on port 3000...');
});

function genToken(appId: string) {
  return jwt.sign({ appId }, appToMapUrl[appId].secretKey);
}
