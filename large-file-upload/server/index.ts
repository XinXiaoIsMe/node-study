import { createReadStream, createWriteStream } from 'node:fs';
import fs from 'node:fs/promises';
import path from 'node:path';
import process from 'node:process';
import { pipeline } from 'node:stream/promises';
import cors from 'cors';
import express from 'express';
import multer from 'multer';

const app = express();
const upload = multer({ storage: multer.memoryStorage() });

const PORT = 3000;
const UPLOAD_ROOT = path.resolve(process.cwd(), 'uploads');
const CHUNK_ROOT = path.join(UPLOAD_ROOT, 'chunks');
const MERGED_ROOT = path.join(UPLOAD_ROOT, 'merged');

interface ResponseBody<T> {
  success: boolean;
  data: T;
  msg: string;
}

function buildSuccess<T>(data: T, msg = 'OK'): ResponseBody<T> {
  return {
    success: true,
    data,
    msg,
  };
}

function buildError(msg: string): ResponseBody<null> {
  return {
    success: false,
    data: null,
    msg,
  };
}

async function ensureDir(dir: string) {
  await fs.mkdir(dir, { recursive: true });
}

async function pathExists(target: string) {
  try {
    await fs.access(target);
    return true;
  }
  catch {
    return false;
  }
}

const getChunkDir = (hash: string) => path.join(CHUNK_ROOT, hash);
const getChunkPath = (hash: string, chunkId: string) => path.join(getChunkDir(hash), chunkId);
const getMergedFilePath = (hash: string, filename: string) => path.join(MERGED_ROOT, `${hash}-${filename}`);

function extractChunkIndex(chunkName: string) {
  const match = chunkName.match(/-(\d+)$/);
  return match ? Number(match[1]) : Number.POSITIVE_INFINITY;
}

app.use(cors());
app.use(express.json());

app.get('/getUploadedChunks/:fileHash', async (req, res) => {
  const { fileHash } = req.params;
  if (!fileHash) {
    return res.status(400).json(buildError('fileHash 不能为空'));
  }
  try {
    const chunkDir = getChunkDir(fileHash);
    const exists = await pathExists(chunkDir);
    if (!exists) {
      return res.json(buildSuccess<string[]>([], '无记录'));
    }
    const chunks = await fs.readdir(chunkDir);
    return res.json(buildSuccess(chunks));
  }
  catch (error) {
    console.error(error);
    return res.status(500).json(buildError('获取已上传分片失败'));
  }
});

app.post('/upload', upload.single('file'), async (req, res) => {
  const { chunkId, fileHash, filename } = req.body ?? {};
  if (!req.file) {
    return res.status(400).json(buildError('缺少分片数据'));
  }
  if (!chunkId || !fileHash || !filename) {
    return res.status(400).json(buildError('缺少必要参数'));
  }

  try {
    await ensureDir(CHUNK_ROOT);
    const chunkDir = getChunkDir(fileHash);
    await ensureDir(chunkDir);
    const chunkPath = getChunkPath(fileHash, chunkId);
    const exists = await pathExists(chunkPath);
    if (exists) {
      return res.json(buildSuccess(true, '分片已存在'));
    }
    await fs.writeFile(chunkPath, req.file.buffer);
    return res.json(buildSuccess(true, '上传成功'));
  }
  catch (error) {
    console.error(error);
    return res.status(500).json(buildError('上传失败'));
  }
});

app.post('/merge', async (req, res) => {
  const { fileHash, filename } = req.body ?? {};
  if (!fileHash || !filename) {
    return res.status(400).json(buildError('缺少 fileHash 或 filename'));
  }

  try {
    const chunkDir = getChunkDir(fileHash);
    const exists = await pathExists(chunkDir);
    if (!exists) {
      return res.status(404).json(buildError('未找到分片数据'));
    }

    await ensureDir(MERGED_ROOT);
    const chunkFiles = await fs.readdir(chunkDir);
    if (chunkFiles.length === 0) {
      return res.status(400).json(buildError('分片列表为空，无法合并'));
    }
    const mergedFilePath = getMergedFilePath(fileHash, filename);
    await fs.rm(mergedFilePath, { force: true });

    chunkFiles.sort((a, b) => extractChunkIndex(a) - extractChunkIndex(b));

    for (const [index, chunkFile] of chunkFiles.entries()) {
      const currentPath = path.join(chunkDir, chunkFile);
      await pipeline(
        createReadStream(currentPath),
        createWriteStream(mergedFilePath, { flags: index === 0 ? 'w' : 'a' }),
      );
    }

    await fs.rm(chunkDir, { recursive: true, force: true });

    return res.json(buildSuccess({ filePath: mergedFilePath }, '合并成功'));
  }
  catch (error) {
    console.error(error);
    return res.status(500).json(buildError('合并失败'));
  }
});

async function bootstrap() {
  await ensureDir(CHUNK_ROOT);
  await ensureDir(MERGED_ROOT);
  app.listen(PORT, () => {
    // eslint-disable-next-line no-console
    console.log(`Server is running on ${PORT}...`);
  });
}

bootstrap().catch((error) => {
  console.error('Server failed to start', error);
  process.exit(1);
});
