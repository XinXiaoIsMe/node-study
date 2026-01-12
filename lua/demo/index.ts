import fs from 'node:fs';
import cors from 'cors';
import express from 'express';
import Redis from 'ioredis';

const app = express();
const redis = new Redis();

const lotteryLua = fs.readFileSync('./lottery.lua', 'utf8');

const TIME = 30;
const CHANGE = 5;
const KEY = 'lottery';

// 跨域处理
app.use(cors());

app.get('/lottery', (_req, res) => {
  redis.eval(lotteryLua, 1, KEY, TIME, CHANGE, (err, result) => {
    if (err) {
      // eslint-disable-next-line no-console
      console.log('error', err);
      res.status(500).send('服务发生错误！');
    }
    if (result === 1) {
      res.send('抽奖成功');
    }
    else {
      res.send('请稍后重试！');
    }
  });
});

app.listen(3000, () => {
  // eslint-disable-next-line no-console
  console.log('Server is running on 3000...');
});
