const fs = require('node:fs');
const ejs = require('ejs');
// marked需要安装低版本，否则不支持commonjs
const { marked } = require('marked');
const browserSync = require('browser-sync');
let browser;

function server () {
  browser = browserSync.create();
  browser.init({
    server: {
      baseDir: './',
      index: 'index.html'
    }
  });
}

function init (cb) {
  const md = fs.readFileSync('./README.md', 'utf-8');
  const html = marked.parse(md);
  ejs.renderFile('./template.ejs', {
    title: 'vue3',
    content: html
  }, (err, data) => {
    if (err) return;

    fs.writeFileSync('./index.html', data, 'utf-8');
    cb?.();
  })
}

// 初始化
init(() => {
  // 启动服务
  server();
});

// 监听文件变化，重新渲染页面
fs.watch('./README.md', (event) => {
  if (event === 'change') {
    init(() => {
      browser.reload();
    });
  }
});
