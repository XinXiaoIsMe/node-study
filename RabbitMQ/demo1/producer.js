/* eslint-disable no-console */
/* eslint-disable node/prefer-global/buffer */
/* eslint-disable antfu/no-top-level-await */
import amqplib from 'amqplib';
import express from 'express';

const app = express();
// 连接MQ
const connection = await amqplib.connect('amqp://localhost');
// 创建一个通道
const channel = await connection.createChannel();
const queueName = 'task_queue';
app.get('/send', (req, res) => {
  const message = req.query.message;
  // 发送消息
  channel.sendToQueue(queueName, Buffer.from(message), {
    persistent: true, // 持久化消息
  });
  res.send('send message success');
});

app.listen(3000, () => {
  console.log('producer listen 3000');
});
