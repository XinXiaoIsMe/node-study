import { spawn } from 'node:child_process';
import process from 'node:process';
import puppeteer from 'puppeteer';

main();

async function main() {
  const browser = await puppeteer.launch({
    headless: false,
    channel: 'chrome', // 使用已经安装的 Chrome，避免缺失下载的浏览器内核
  });
  const page = await browser.newPage();
  page.setViewport({
    width: 1280,
    height: 700,
  });

  const btnText = process.argv[2];

  await page.goto('https://juejin.cn/'); // 跳转到掘金
  await page.waitForSelector('.side-navigator-wrap'); // 等待这个元素出现
  const elements = await page.$$('.side-navigator-wrap .nav-item-wrap span'); // 获取menu下面的span

  const articleList: string[] = [];
  const collectFunc = async () => {
    // 获取列表的信息
    await page.waitForSelector('.entry-list');
    const elements = await page.$$('.entry-list .title-row a');
    for await (const el of elements) {
      const text = await el.getProperty('innerText');
      const name = await text.jsonValue();
      articleList.push(name);
    }
    // 调用python脚本进行中文分词 输出词云图
    const pythonProcess = spawn('python3', ['index.py', articleList.join(',')]);
    pythonProcess.stdout.on('data', (data) => {
      // eslint-disable-next-line no-console
      console.log(data.toString());
    });
    pythonProcess.stderr.on('data', (data) => {
      // eslint-disable-next-line no-console
      console.log(data.toString());
    });
    pythonProcess.on('close', (code) => {
      // eslint-disable-next-line no-console
      console.log(`child process exited with code ${code}`);
    });
  };

  for await (const el of elements) {
    const text = await el.getProperty('innerText'); // 获取span的属性
    const name = await text.jsonValue(); // 获取内容
    if (name.trim() === (btnText || '前端')) {
      await el.click(); // 自动点击对应的菜单
      collectFunc(); // 调用函数
    }
  }
}
