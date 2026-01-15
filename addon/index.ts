/* eslint-disable ts/no-require-imports */
interface CpuAddon {
  getScreenSize: () => { width: number; height: number };
}
// 需要首先全局安装node-gyp和python，然后运行node-gyp configure build生成cpu.node文件（在mac环境正常运行）
// pnpm i node-gyp -g
// brew install python
// 详情查看：https://juejin.cn/post/7346082867087032370
// 注意mac中不需要安装windows编译工具，直接运行即可
const addon = require('./build/Release/cpu.node') as CpuAddon;

main();

function main() {
  const screenSize = addon.getScreenSize();
  // eslint-disable-next-line no-console
  console.log(screenSize);
}
