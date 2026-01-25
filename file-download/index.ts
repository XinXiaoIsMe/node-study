import type { Request, Response } from 'express';
import type { Buffer } from 'node:buffer';
import fs from 'node:fs';
import path from 'node:path';
import cors from 'cors';
import express from 'express';

const app = express();

app.use(cors({ exposedHeaders: ['Content-Disposition'] }));

function encodeRFC5987(value: string): string {
  // RFC 5987：用于 filename* 的 UTF-8 百分号编码
  return encodeURIComponent(value)
    .replace(/['()]/g, escape)
    .replace(/\*/g, '%2A');
}

function buildContentDisposition(type: 'inline' | 'attachment', fileName: string): string {
  // filename：简单兜底（非 ASCII 替换为 _），filename*：完整支持中文/特殊字符
  const fallbackAscii = fileName.replace(/[^\x20-\x7E]+/g, '_');
  return `${type}; filename="${fallbackAscii}"; filename*=UTF-8''${encodeRFC5987(fileName)}`;
}

app.get('/file/list', (_req: Request, res: Response) => {
  const fileList = fs.readdirSync('./assets');
  res.json(fileList);
});

app.get('/file/download', (req: Request, res: Response) => {
  const fileName = req.query.fileName as string;
  if (!fileName) {
    res.status(400).json({ code: 400, msg: 'fileName is required' });
    return;
  }

  // 简单防止目录穿越：只允许纯文件名
  const safeFileName = path.basename(fileName);
  if (safeFileName !== fileName) {
    res.status(400).json({ code: 400, msg: 'invalid fileName' });
    return;
  }

  const assetsDir = path.resolve('./assets');
  const filePath = path.resolve(assetsDir, safeFileName);

  fs.readFile(filePath, (err, data) => {
    if (err) {
      res.status(404).json({ code: 404, msg: 'file not found' });
      return;
    }

    const ext = safeFileName.split('.').pop()?.toLowerCase() ?? '';
    const dispositionType: 'inline' | 'attachment' = ext === 'png' ? 'inline' : 'attachment';

    // png 想要在浏览器里预览，需要正确的 Content-Type
    if (ext === 'png') res.type('png');
    else res.setHeader('Content-Type', 'application/octet-stream');

    res.setHeader('Content-Disposition', buildContentDisposition(dispositionType, safeFileName));
    res.send(data as Buffer);
  });
});

app.listen(3000, () => {
  // eslint-disable-next-line no-console
  console.log('Server is running on port 3000');
});
