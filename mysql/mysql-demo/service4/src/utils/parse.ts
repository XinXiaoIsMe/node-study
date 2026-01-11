import { Buffer } from 'node:buffer';

export function parseBase64Avatar(input: unknown) {
  if (typeof input !== 'string' || !input) {
    return null;
  }
  const match = input.match(/^data:(.+);base64,(.+)$/);
  if (!match) {
    return null;
  }
  const mimeType = match[1];
  if (!mimeType.startsWith('image/')) {
    return null;
  }
  const buffer = Buffer.from(match[2], 'base64');

  return {
    mimeType,
    data: buffer,
    size: buffer.length,
  };
}
