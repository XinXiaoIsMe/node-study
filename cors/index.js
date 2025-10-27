import express from 'express';

const app = express();

app.use(express.json());

app.use((req, res, next) => {
    // https://juejin.cn/post/7321586653113368610
    // 设置可以跨域访问的域名
    res.setHeader('Access-Control-Allow-Origin', 'http://127.0.0.1:5500');
    // 设置可以添加到请求头的字段
    res.setHeader('Access-Control-Allow-Headers', 'Auth,Content-Type');
    // 设置可以访问的非简单请求
    res.setHeader('Access-Control-Allow-Methods', 'PUT');
    // 允许自定义响应头被前端访问
    res.setHeader('Access-Control-Expose-Headers', 'user-id');
    next();
});

app.get('/data', (req, res) => {
    res.send({
        status: 200,
        data: 123
    });
});

app.get('/getUserInfo', (req, res) => {
    res.send({
        status: 200,
        data: {
            username: '张三',
            age: 17
        }
    });
});

app.put('/setUsername', (req, res) => {
    // 设置自定义响应头
    res.set('user-id', req.body.id);
    res.send({
        status: 200,
        msg: '修改成功！'
    });
});

// SSE（Server-Sent Events）服务器主动向客户端发送数据
// 非HTTP2的情况下，每个浏览器的sse数量限制为6：https://developer.mozilla.org/en-US/docs/Web/API/Server-sent_events/Using_server-sent_events
app.get('/sse', (req, res) => {
    res.setHeader('content-type', 'text/event-stream');
    res.status(200);
    let count = 0;
    const timer = setInterval(() => {
        if (count >= 10) {
            clearInterval(timer);
            return;
        }
        count ++;
        // 指定事件名为test，前端监听test事件，如果不指定，则前端需要监听message事件。
        res.write('event: test\n');
        // 设置数据，必须以data:开头，否则整个数据会被当成一个字段，而字段值为空。数据之间由一对换行符分割
        res.write('data: ' + new Date().getTime() + '\n\n');
        // 以下数据没有指定事件名，则默认为message事件
        res.write('data: ' + new Date().getTime() + '\n\n');
        // 实际chrome测试时，注释掉上两行代码，添加以下代码后，sse不再发送数据
        // res.write('test\n\n');
    }, 1000);
});

app.listen(3000, () => {
    console.log('Server is running on 3000...');
});
