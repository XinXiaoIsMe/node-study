// process挂载在global上，可全局使用
console.log(process.arch) // 获取cpu信息，等价于os.arch()
console.log(process.platform) // 获取操作系统类型，等价于os.platform()

console.log(process.argv) // 返回进程参数
// 终端运行 node process --version
// [
//   '/Users/xx/Library/Application Support/fnm/node-versions/v20.15.0/installation/bin/node', // 运行命令的工具
//   '/Volumes/ccattempt/code/node-study/process', // 运行的文件
//   '--version' // 命令携带的参数，可以有多个参数，用空格分隔
// ]

// 获取工作目录，等价于__dirname，但是在esm模式下使用不了__dirname
console.log(process.cwd())

// 内存信息
console.log(process.memoryUsage())
// {
//   rss: 32456704, 常驻集大小 物理内存的存量
//   heapTotal: 4243456, V8分配的堆内存的总大小，包括未使用的内存
//   heapUsed: 3488512, 已经使用的内存
//   external: 1389971, 外部的内存（C、C++使用的）
//   arrayBuffers: 10515 二进制的总量
// }

// 监听退出进程事件，需要在执行process.exit()之前调用
// process.on('exit', () => {
//   console.log('进程已经退出')
// })

// // 退出进程
// console.log(process.exit())
// // 这一行不会打印，因为进程已经退出
// console.log('exit')

setTimeout(() => {
  // 杀死进程，需要传入进程id
  process.kill(process.pid)
}, 1000)

// 环境变量(跨平台)
console.log(process.env) // 操作系统中所有环境变量
// 修改process.env只在当前进程生效，不会真正影响系统的环境变量
process.env.USER = 'xx'
console.log(process.env.USER) // xx
// 在前端中常用于判断项目环境（开发环境、生产环境）
