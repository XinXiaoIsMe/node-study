import mysql from 'mysql2/promise';
import { appConfig } from './config';

export const pool = mysql.createPool({
    user: appConfig.db.user,
    password: appConfig.db.password,
    host: appConfig.db.host,
    port: appConfig.db.port,
    database: appConfig.db.database,
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
});
