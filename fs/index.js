const fs = require('node:fs')
const fs2 = require('node:fs/promises')
const path = require('path')

const filePath = path.resolve(__dirname, './book.txt')

// fs.readFile(filePath, (err, data) => {
//   console.log(err, data.toString())
// })

// console.log(fs.readFileSync(filePath, { encoding: 'utf-8' }))

// fs2.readFile(filePath).then(data => {
//   console.log(data.toString())
// }).catch(err => {
//   console.log(err)
// })

// 创建可读流（用于读取大文件）
// const readStream = fs.createReadStream(path.resolve(__dirname, './classic_literature_1MB.txt'))
// readStream.on('data', chunk => {
//   console.log(chunk.toString())
// })
// readStream.on('end', () => {
//   console.log('读取完成')
// })

// 创建文件夹
// fs.mkdirSync(path.resolve(__dirname, 'a'))
// // 创建多层文件夹
// fs.mkdirSync(path.resolve(__dirname, './books/a/b'), {
//   recursive: true
// })
// 删除文件夹
// fs.rmdirSync(path.resolve(__dirname, 'a')) // 这个api在删除的时候，如果文件夹下有内容，则会失败
// fs.rmSync(path.resolve(__dirname, './books'), { recursive: true })

// 重命名文件
// fs.renameSync(path.resolve(__dirname, 'a'), path.resolve(__dirname, 'b'))

// 监听文件
// fs.watch(path.resolve(__dirname, 'book.txt'), (event, filename) => {
//   // event: rename | change
//   console.log(event, filename)
// });

// fs.readFile(path.resolve(__dirname, './book.txt'), (err, data) => {
//   if (err) return
//   console.log('fs') // 后执行
// })

// setImmediate(() => {
//   console.log('setImmediate') // 先执行
// })

// setImmediate会先打印，然后打印fs。
// 因为fs操作由libuv完成，必须等待libuv读取完文件后再推入V8的事件循环
// 而setImmediate会将回调函数直接推入V8的事件循环，因此先执行setImmediate

// fs.writeFileSync(path.resolve(__dirname, 'test.txt'), 'hello, world')
// fs.writeFileSync(path.resolve(__dirname, 'test.txt'), '\n你好, 世界', {
//   flag: 'a' // 追加到原文本后面，默认是会直接替换
// })
// fs.appendFileSync(path.resolve(__dirname, 'test.txt'), '\n你好, 世界')
// fs.appendFile(path.resolve(__dirname, 'test.txt'), '\n你好, 世界', (err) => {
//   console.log(err)
// }) // 追加到原文本后面

// 大量数据分批插入，可以使用可写流
// const verse = [
//   '床前明月光',
//   '疑是地上霜',
//   '举头望明月',
//   '低头思故乡'
// ]
// const writeStream = fs.createWriteStream(path.resolve(__dirname, 'poem.txt'))
// verse.forEach(s => {
//   writeStream.write(s + '\n')
// })
// writeStream.end()
// writeStream.on('finish', () => {
//   console.log('写入完成')
// })

// 硬链接 类似js中的引用，指向源文件内存地址，删掉源文件，对硬链接没有影响
// fs.linkSync(path.resolve(__dirname, 'book.txt'), path.resolve(__dirname, 'book2.txt'))
// 软链接 类似快捷方式，指向源文件路径，删掉源文件后，软链接记录的源文件路径会失效，软链接会被破坏。生成软链接需要管理员权限
// fs.symlinkSync(path.resolve(__dirname, 'book.txt'), path.resolve(__dirname, 'book3.txt'))
