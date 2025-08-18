const { createReadStream, createWriteStream } = require('node:fs');
const {
  createGzip,
  createGunzip,
  createDeflate,
  createInflate
} = require('node:zlib');

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
createReadStream('./test.txt.deflate')
  .pipe(createInflate())
  .pipe(createWriteStream('./test3.txt'))