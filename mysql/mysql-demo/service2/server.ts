import express from 'express';
import { corsMiddleware } from './middleware/cors';
import authRoutes from './routes/authRoutes';


const app = express();

// 处理跨域
app.use(corsMiddleware);

app.use('/api', authRoutes);

app.listen(3000, () => {
    console.log('Server is running on 3000...')
})