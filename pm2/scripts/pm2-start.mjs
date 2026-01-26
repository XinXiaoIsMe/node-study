import { spawnSync } from 'node:child_process';
import { existsSync, mkdirSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import process from 'node:process';
import { fileURLToPath } from 'node:url';

function main() {
  const envName = process.argv[2]; // 可选：production

  const scriptDir = dirname(fileURLToPath(import.meta.url));
  const projectRoot = resolve(scriptDir, '..');
  const pm2Home = resolve(projectRoot, '.pm2');
  const ecosystemFile = resolve(projectRoot, 'ecosystem.config.cjs');

  const isWindows = process.platform === 'win32';

  if (!existsSync(ecosystemFile)) {
    console.error(`[pm2-start] 找不到生态文件：${ecosystemFile}`);
    process.exit(1);
  }

  // 统一在项目内指定 PM2_HOME，避免默认写入用户目录导致权限问题
  mkdirSync(pm2Home, { recursive: true });

  const args = ['start', ecosystemFile];
  if (envName)
    args.push('--env', envName);

  const baseOptions = {
    cwd: projectRoot,
    stdio: 'inherit',
    env: { ...process.env, PM2_HOME: pm2Home },
    windowsHide: true,
    shell: isWindows,
  };

  let result = spawnSync('pm2', args, baseOptions);
  if (result.error) {
    console.error(`[pm2-start] 启动失败：${result.error.message}`);
  }
  else if ((result.status ?? 1) !== 0) {
    // 如果守护进程模式被系统策略/权限拦截，兜底用前台模式跑起来
    result = spawnSync('pm2', [...args, '--no-daemon'], baseOptions);
  }

  process.exit(result.status ?? 1);
}

main();
