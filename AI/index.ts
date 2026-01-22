import type { NextFunction, Request, Response } from 'express';
import process from 'node:process';
import dotenv from 'dotenv';
import express from 'express';
import OpenAI from 'openai';

dotenv.config(); // 注册环境变量（推荐使用 OPENAI_API_KEY）

function getEnvNumber(name: string, fallback: number): number {
  const raw = process.env[name];
  if (!raw)
    return fallback;
  const num = Number(raw);
  return Number.isFinite(num) ? num : fallback;
}

const apiKey = process.env.OPENAI_API_KEY ?? process.env.API_KEY ?? process.env['API-KEY'];
const baseURL = process.env.OPENAI_BASE_URL;
const timeout = getEnvNumber('OPENAI_TIMEOUT_MS', 30_000);
const maxRetries = getEnvNumber('OPENAI_MAX_RETRIES', 0);

if (!apiKey) {
  throw new Error('缺少 API Key：请在 .env 里设置 OPENAI_API_KEY（推荐）或 API_KEY / API-KEY');
}

const openai = new OpenAI({
  apiKey,
  baseURL,
  timeout,
  maxRetries,
});

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.get('/health', (_req, res) => {
  res.json({
    ok: true,
    baseURL: baseURL ?? 'https://api.openai.com/v1',
    timeout,
    maxRetries,
  });
});

// 文本对话
app.post('/chat', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { message } = req.body as { message?: unknown }; // message就是你要问的问题
    if (typeof message !== 'string' || message.trim().length === 0) {
      res.status(400).json({ error: 'message 不能为空字符串' });
      return;
    }

    // 说明：你原来的 'GPT-5.2' 不是 OpenAI API 的有效模型名，会直接报错
    const model = process.env.OPENAI_CHAT_MODEL ?? 'gpt-4o-mini';
    const completion = await openai.chat.completions.create({
      model,
      messages: [{ role: 'user', content: message }],
    });

    res.json({
      result: completion.choices[0]?.message?.content ?? '',
    });
  }
  catch (error) {
    next(error);
  }
});

// 生成图片
app.post('/create/image', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { prompt } = req.body as { prompt?: unknown }; // 你要描述的图片信息
    if (typeof prompt !== 'string' || prompt.trim().length === 0) {
      res.status(400).json({ error: 'prompt 不能为空字符串' });
      return;
    }

    // 说明：如果你希望拿到 url，优先用 dall-e-3（GPT Image 模型通常返回 b64_json）
    const model = process.env.OPENAI_IMAGE_MODEL ?? 'dall-e-3';
    const completion = await openai.images.generate({
      model,
      prompt,
      n: 1,
      size: '1024x1024',
      response_format: 'url',
    });

    res.json({
      result: completion.data?.[0]?.url ?? '',
    });
  }
  catch (error) {
    next(error);
  }
});

// 统一错误返回，避免前端只能等到“超时”
app.use((error: unknown, _req: Request, res: Response, _next: NextFunction) => {
  console.error(error);

  const err = error as { message?: string; status?: number; name?: string; code?: string };
  const status = typeof err.status === 'number' ? err.status : 500;

  res.status(status).json({
    error: err.message ?? '请求失败',
    name: err.name,
    code: err.code,
    status,
  });
});

app.listen(3000, () => {
  // eslint-disable-next-line no-console
  console.log('Server is running on port 3000');
});
