import express from 'express';
import { corsMiddleware } from './middleware/cors';
import { attachSession } from './middleware/auth';
import authRoutes from './routes/authRoutes';
import userRoutes from './routes/userRoutes';

const app = express();

// 将mimetype为application/json请求的请求体转为json对象挂载到req.body上
app.use(express.json());
// 将表单格式的请求(例如：name=Tom&age=18)转为json对象挂载到req.body上
app.use(express.urlencoded({
    // 使用qs库进行转换，可以解析嵌套对象，如果设置为false则使用nodejs内置的解析器，只能解析简单对象
    extended: true
}));
// 处理跨域
app.use(corsMiddleware);
// 在req上添加session信息
app.use(attachSession);

// 路由
app.use('/api', authRoutes);
app.use('/api/users', userRoutes);

app.listen(3000, () => {
    console.log('Server is running on 3000...')
})