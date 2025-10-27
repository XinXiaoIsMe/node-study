import path from 'node:path';
import express from 'express';

const app = express();
const WRITE_LIST = ['localhost'];
// 添加中间件实现防盗链
app.use(preventHotLinking);
app.use('/assets', express.static('static'));

app.get('/', (req, res) => {
    res.sendFile(path.resolve(process.cwd(), 'static/index.html'));
});

app.listen(3000, () => {
    console.log('Server is running on 3000...');
});

function preventHotLinking (req, res, next) {
    const referer = req.get('referer');
    if (referer) {
        const { hostname } = new URL(referer);
        if (!WRITE_LIST.includes(hostname)) {
            // 如果不在白名单里面，则禁止访问
            // localhost可以访问，但是127.0.0.1:3000不能访问图片
            res.status(403).send('Forbidden');
            return;
        }
    }
    next();
}
