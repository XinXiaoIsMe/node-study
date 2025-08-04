const os = require('os')
const { exec } = require('child_process')

// 根据不同操作系统在浏览器打开网址
function open (url) {
  const platform = os.platform()
  switch (platform) {
    // mac系统
    case 'darwin':
      exec(`open ${url}`)
      break
    // windows系统
    case 'win32':
      exec(`start ${url}`)
      break
    // linux系统
    case 'linux':
      exec(`xdg-open ${url}`)
      break
    default:
      break
  }
}

// 在浏览器打开百度
open('https://www.baidu.com')
