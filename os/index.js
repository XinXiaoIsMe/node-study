const os = require('os')
console.log(os.platform()) // 操作系统类型 darwin
console.log(os.release()) // 操作系统发布版本 21.1.0
console.log(os.type()) // 操作系统类型，字符串 Darwin
console.log(os.version()) // 操作系统版本 Darwin Kernel Version 21.1.0: Wed Oct 13 17:33:24 PDT 2021; root:xnu-8019.41.5~1/RELEASE_ARM64_T8101

// 获取当前用户目录：windows：%userprofile% mac: $HOME
console.log(os.homedir())

// cpu架构(安卓里面用的多) arm64
console.log(os.arch())

// 操作系统cpu的信息
// console.log(os.cpus())
console.log(os.cpus().length) // 8,说明可以跑8个线程
// {
//   model: 'Apple M1', // CPU型号
//   speed: 2400, // CPU运行时钟的速率
//   times: { // 单位为ms
//      user: 4578750, // 用户使用程序的时间
//      nice: 0, // 优先级比较低的用户程序使用的时间
//      sys: 2201530, // 系统内核使用的时间
//      idle: 14331410, // 空闲时间
//      irq: 0 // 硬件被中断使用的时间
//   }
// }

// 网络信息
// console.log(os.networkInterfaces())
// {
//   address: '::1', // ip地址
//   netmask: 'ffff:ffff:ffff:ffff:ffff:ffff:ffff:ffff', // 子网掩码
//   family: 'IPv6', // ip版本，IPv4 / IPv6
//   mac: '00:00:00:00:00:00', // 网卡的mac地址
//   internal: true, // 是否内网ip
//   cidr: '::1/128', // ip地址段
//   scopeid: 0
// }
