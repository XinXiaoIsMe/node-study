import crypto from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const _filename = fileURLToPath(import.meta.url);
export const _dirname = path.dirname(_filename);

export function createFileHash(filePath: string) {
  return crypto.createHash('sha256').update(fs.readFileSync(filePath)).digest('hex');
}

export function getModifyTime(filePath: string) {
  return fs.statSync(filePath).mtime.toUTCString(); // 获取文件最后修改时间
}
