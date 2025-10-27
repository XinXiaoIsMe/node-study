const path = require('node:path');
const express = require('express');
const { readData } = require('./utils');
const router = require('./router');

const app = express();

// 设置client文件夹为静态文件夹，使得网站可以直接访问client文件夹里面的内容，避免html页面中访问css和js文件报错
app.use(express.static(path.join(__dirname, 'client')));
// 设置解析body的中间件，使得req中存在body属性
app.use(express.json());
// 使用路由
app.use(router);
// 设置渲染引擎为ejs
app.set('view engine', 'ejs');
// 指定ejs模板的位置
app.set('views', path.join(__dirname, 'client'));

app.get('/', (req, res) => {
    render(res);
});

app.listen(3000, () => {
    console.log('Server is running on port 3000...')
});

/**
 * 渲染ejs页面
 * @param {*} res 
 */
async function render (res) {
    const [err, data] = await readData();

    if (err) {
        res.end(`服务器异常：${err}`);
        return;
    }

    res.render('index', {
        tasks: data
    });
}


