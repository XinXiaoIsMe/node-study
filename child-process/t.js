// 接收来自主进程的消息
process.on('message', msg => {
  console.log(`[子进程]：${msg}`)
})

// 向主进程发送消息
process.send('我是子进程')