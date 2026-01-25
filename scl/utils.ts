// scl/index.ts
import os from 'node:os';

function getLocalIPv4List(): string[] {
  // 读取所有网卡信息，筛选非内网的 IPv4 地址
  const nets = os.networkInterfaces();
  const result: string[] = [];

  for (const name of Object.keys(nets)) {
    const items = nets[name];
    if (!items)
      continue;

    for (const item of items) {
      if (item.family === 'IPv4' && !item.internal) {
        result.push(item.address);
      }
    }
  }

  return result;
}

export function getLocalIPv4(): string | null {
  // 取第一个可用的 IPv4（有多网卡时可能不是你想要的那个）
  return getLocalIPv4List()[0] ?? null;
}
