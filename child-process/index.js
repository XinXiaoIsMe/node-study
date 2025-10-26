const {
  exec,
  execSync,
  spawn,
  spawnSync,
  execFile,
  execFileSync,
  fork
} = require('child_process')
const path = require('path')

// exec的stdout默认最大长度为1024*1024个字节，超出这个字节会报错
// exec('node -v', (err, stdout, stderr) => {
//   if (err) return err

//   // stdout：string | Buffer
//   // stderr：string | Buffer
//   console.log(stdout) // 输出 v20.15.0
// })

// const version = execSync('node -v')
// console.log(`version: ${version}`)

// 打开软件，后面也可以接参数
// execSync('open /Applications/QQ.app')

// spawn也用于执行命令，但是没有字节上限，实时返回流，
// const { stdout, stderr } = spawn('netstat', ['-a'])
// stdout.on('data', data => {
//   console.log(`data: ${data.toString()}`)
// })
// stderr.on('data', data => {
//   console.log(`err: ${data.toString()}`)
// })
// stdout.on('close', () => {
//   console.log('Over!')
// })

// const { stdout, stderr } = spawnSync('node', ['-v'])
// console.log({
//   stdout: stdout.toString(),
//   stderr: stderr.toString()
// })

// 执行可执行文件，例如windows上的cwd后缀的文件，mac上的sh后缀的文件
// const scriptPath = path.resolve(__dirname, 'test.sh');
// 添加执行权限（如果没有设置, 可能会没有执行权限导致执行报错）
// execSync(`chmod +x ${scriptPath}`);
// shell设置为true，表示使用shell执行
// execFile(path.resolve(__dirname, 'test.sh'), { shell: true }, (err, stdout, stderr) => {
//   console.log(stdout.toString())
// })

// 底层实现顺序,exec使用execFile实现，execFile使用spawn实现
// exec => execFile => spawn

// 模拟实现execFile
// function execFile (file, args, options, callback) {
//   if (typeof args === 'function') {
//     callback = args
//     args = []
//     options = {}
//   }

//   if (typeof options === 'function') {
//     callback = options
//     options = {}
//   }

//   const child = spawn(file, args, options)
//   if (!callback) return child

//   let stdout = ''
//   let stderr = ''
//   child.stdout.setEncoding('utf8')
//   child.stderr.setEncoding('utf8')

//   // 这里缓存了stdout和stderr，因此可能会出现数据量太大的情况
//   child.stdout.on('data', data => {
//     stdout += data.toString()
//   })
//   child.stderr.on('data', data => {
//     stderr += data.toString()
//   })
//   child.on('close', (code, signal) => {
//     let err = null
//     if (code !== 0) {
//       err = new Error(`Command failed. ${file}: \n${stderr}`)
//       err.code = code
//       err.signal = signal
//     }
//     callback(err, stdout, stderr)
//   })
//   return child
// }

// // 模拟实现exec
// function exec (command, options, callback) {
//   const shell = typeof options?.shell === 'string' ? options.shell : '/bin/sh'
//   return execFile(`${shell}`, ['-c', command], options, callback)
// }

// 返回一个子进程，只能执行js文件（可以将一些耗时的操作放在子进程，防止阻塞）
// 底层使用IPC通信，IPC使用libuv实现，libuv在windows下使用windows named pipe实现，posix相关系统则使用unix domain socker实现
const testProcess = fork(path.resolve(__dirname, 't.js'))
// 向子进程发送消息
testProcess.send('我是主进程')
// 接收子进程消息
testProcess.on('message', msg => {
  console.log(`[主进程]：${msg}`)
})
