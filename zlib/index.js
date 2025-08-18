const { createReadStream, createWriteStream } = require('node:fs');
const {
  createGzip,
  createGunzip,
  createDeflate,
  createInflate,
  gzipSync,
  deflateSync
} = require('node:zlib');
const { createServer } = require('node:http');

// gzip压缩
// createReadStream('./test.txt')
//   .pipe(createGzip({ level: 9 }))
//   .pipe(createWriteStream('./test.txt.gz'));

// gzip解压缩
// createReadStream('./test.txt.gz')
//   .pipe(createGunzip())
//   .pipe(createWriteStream('./test2.txt'))

// Deflate压缩
// createReadStream('./test.txt')
//   .pipe(createDeflate())
//   .pipe(createWriteStream('./test.txt.deflate'))

// Deflate解压缩
// createReadStream('./test.txt.deflate')
//   .pipe(createInflate())
//   .pipe(createWriteStream('./test3.txt'))

const server = createServer((req, res) => {
  const txt = '测试文字'.repeat(1000);
  res.setHeader('Content-type', 'text/plain;charset=utf-8');
  // res.end(txt); // 12.2kb

  // 使用gzip压缩
  // res.setHeader('Content-Encoding', 'gzip')
  // res.end(gzipSync(txt)); // 0.3kb

  // 使用deflate压缩
  res.setHeader('Content-Encoding', 'deflate')
  res.end(deflateSync(txt)); // 0.3kb

  // deflate压缩会比gzip压缩更快一点，更小一点，但是差距不大
  // gzip适合压缩文件（无损），deflate适合压缩http里面编码的内容
});

server.listen(3000, () => {
  console.log('服务已经启动：http://localhost:3000')
}); // 端口号小于65535都可以用
