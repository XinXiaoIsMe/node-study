import mysql from 'mysql2/promise';
import { appConfig } from './config';

// 创建数据库连接池
export const pool = mysql.createPool({
    user: appConfig.db.user,
    password: appConfig.db.password,
    host: appConfig.db.host,
    port: appConfig.db.port,
    database: appConfig.db.database,
    // 当连接池中所有连接都被占用时，进入队列排队，等待有空闲连接后再执行
    waitForConnections: true,
    // 最大连接数量
    connectionLimit: 10,
    // 设置队列最多可以存放多少个连接请求，如果设为0则表示不限制
    queueLimit: 100
});
