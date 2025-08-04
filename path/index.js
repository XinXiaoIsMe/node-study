const path = require('path')

console.log(path.dirname('F:/utils/types/array.js')) // F:/utils/types
console.log(path.basename('F:/utils/types/array.js')) // array.js
console.log(path.extname('F:/utils/types/array.js')) // .js
console.log(path.parse('F:/utils/types/array.js'))
// {
//   root: '',
//   dir: 'F:/utils/types',
//   base: 'array.js',
//   ext: '.js',
//   name: 'array'
// }
console.log(path.format({
  root: '',
  dir: 'F:/utils/types',
  base: 'array.js',
  ext: '.js',
  name: 'array'
})) // F:/utils/types/array.js
// 返回拼接后的路径，简单的将路径使用系统分隔符拼接起来
console.log(path.join('/utils', '/array')) // /utils/array
// 返回绝对路径，从右向左检查，如果遇到绝对路径(以/或者类似C:\开头)，则左侧所有路径都忽略（./a /B ./c被忽略）
console.log(path.resolve('./a', '/B', './c', '/D', './test.js')) // /D/test.js
// 如果只有相对路径，则会拼接上当前命令执行所在的文件夹路径（例如在node-study下打开终端运行，结果如下）
console.log(path.resolve('./test.js')) // /Volumes/ccattempt/code/node-study/test.js
// __dirname 表示当前文件所在文件夹绝对路径
console.log(path.resolve(__dirname, './test.js')) // /Volumes/ccattempt/code/node-study/path/test.js