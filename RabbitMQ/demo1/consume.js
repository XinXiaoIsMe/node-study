/* eslint-disable no-console */

/* eslint-disable antfu/no-top-level-await */
import amqplib from 'amqplib';

const queueName = 'task_queue';
// 连接
const connection = await amqplib.connect('amqp://localhost');
const channel = await connection.createChannel();

// 连接队列
await channel.assertQueue(queueName, {
  durable: true, // 队列持久化
});
// 消息者监听器
channel.consume(queueName, (msg) => {
  console.log(`[x] Received ${msg.content.toString()}`);
  channel.ack(msg); // 确认消费该消息
});
