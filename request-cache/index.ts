import type { Request, Response } from 'express';
import path from 'node:path';
import cors from 'cors';
import express from 'express';
// eslint-disable-next-line perfectionist/sort-named-imports
import { _dirname, getModifyTime, createFileHash } from './utils';

const app = express();

app.use(cors());

app.get('/testStrongCache', (_req: Request, res: Response) => {
  // Expires方式设置强缓存
  // Expires 设置缓存过期时间，浏览器根据当前请求时间和这个过期时间比较，判断缓存是否过期
  // 但是由于服务器和浏览器日期可能存在时区等问题，会导致判断不准确。
  // res.setHeader('Expires', new Date(2027, 0, 20).toUTCString());

  // maxAge方式设置强缓存
  const maxAge = 1 * 3600; // 缓存存活时间，单位是秒
  // 设置过期时间为1h
  res.setHeader('Cache-Control', `max-age=${maxAge}`);
  res.json({
    msg: '强缓存测试',
  });
});

// 测试协商缓存
app.get('/testConditionCache', (req: Request, res: Response) => {
  const assetPath = path.resolve(_dirname, 'assets/test.txt');
  // 禁用强缓存，强制使用协商缓存
  // 注：完全禁用缓存使用no-store
  res.setHeader('Cache-Control', 'no-cache');

  // Last-Modified方式设置协商缓存
  // 服务器设置Last-Modified响应头为文件的最后一次修改时间，浏览器再次发送请求时，会将这个值
  // 放在if-modified-since请求头中发送给服务器，服务器通过判断两个时间是否相等来决定是否使用
  // 缓存。但当文件内容未改变，仅改变文件名时，也会造成修改时间变化，从而导致缓存失效
  // const lastModified = getModifyTime(assetPath);
  // res.setHeader('Last-Modified', lastModified);
  // const ifModifiedSince = req.headers['if-modified-since'];
  // const ifModifiedSinceValue = Array.isArray(ifModifiedSince)
  //   ? ifModifiedSince[0]
  //   : ifModifiedSince;

  // 判断两个修改时间是否一致，如果一致则返回304，告知浏览器使用缓存数据
  // if (
  //   ifModifiedSinceValue
  //   && new Date(ifModifiedSinceValue).getTime() >= new Date(lastModified).getTime()
  // ) {
  //   res.status(304).end();
  //   return;
  // }

  // ETag方式设置协商缓存
  // 服务器设置ETag响应头为文件内容的哈希值，浏览器再次发送请求时，会将这个值放在If-None-Match
  // 请求头中发送给服务器，服务器会再次生成哈希值，并判断两个哈希值是否一致，如果一致则返回304
  // 告知浏览器使用缓存数据。这种方式解决了上述Last-Modified的缺陷
  // 注：express会默认生成etag，这里我们手动设置覆盖下，用于测试
  const etag = createFileHash(assetPath);
  res.setHeader('ETag', etag);
  res.sendFile(path.resolve(_dirname, './assets/test.txt'));
});

app.listen(3000, () => {
  // eslint-disable-next-line no-console
  console.log('Server is running on port 3000...');
});
