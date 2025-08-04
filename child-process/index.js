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
exec('node -v', (err, stdout, stderr) => {
  if (err) return err

  // stdout：string | Buffer
  // stderr：string | Buffer
  console.log(stdout) // 输出 v20.15.0
})

const version = execSync('node -v')
console.log(`version: ${version}`)

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

// 执行可执行文件，例如windows上的cwd后缀的文件，mac上的sh后缀的文件
// const scriptPath = path.resolve(__dirname, 'test.sh');
// 添加执行权限（如果没有设置, 可能会没有执行权限导致执行报错）
// execSync(`chmod +x ${scriptPath}`);
// execFile(path.resolve(__dirname, 'test.sh'), { shell: true }, (err, stdout, stderr) => {
//   console.log(stdout.toString())
// })

// 底层实现顺序,exec使用execFile实现，execFile使用spawn实现
// exec => execFile => spawn

// 返回一个子进程，只能执行js文件（可以将一些耗时的操作放在子进程，防止阻塞）
// 底层使用IPC通信，IPC使用libuv实现，libuv在windows下使用windows named pipe实现，posix相关系统则使用unix domain socker实现
const testProcess = fork(path.resolve(__dirname, 't.js'))
// 向子进程发送消息
testProcess.send('我是主进程')
// 接收子进程消息
testProcess.on('message', msg => {
  console.log(`[主进程]：${msg}`)
})
