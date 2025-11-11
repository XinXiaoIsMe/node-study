import { exec, execSync } from 'node:child_process';
import { promisify } from 'node:util';

const execAsync = promisify(exec);

interface GitUser {
    name: string | null;
    email: string | null;
}

export async function getGitUser (cwd: string = process.cwd()): Promise<GitUser> {
    // 统一执行 git config 命令，macOS 与 Windows 命令相同
    const getValue = async (key: string) => {
        const { stdout } = await execAsync(`git config --get ${key}`, { cwd });
        return stdout.trim() || null;
    };

    const name = await getValue('user.name');
    const email = await getValue('user.email');

    // 若 git config 没有，尝试读取环境变量兜底
    return {
        name: name ?? process.env.GIT_AUTHOR_NAME ?? null,
        email: email ?? process.env.GIT_AUTHOR_EMAIL ?? null
    }
}

export function getGitUserSync (cwd: string = process.cwd()): GitUser {
    // 统一执行 git config 命令，macOS 与 Windows 命令相同
    const getValue = (key: string) => {
        try {
            const buffer = execSync(`git config --get ${key}`, {
                cwd,
                // 忽略输入、缓冲输出，错误输出继承到终端
                stdio: ['ignore', 'pipe', 'inherit']
            });
            const output = buffer.toString().trim();
            return output || null;
        } catch {
            return null;
        }
    };

    const name = getValue('user.name');
    const email = getValue('user.email');

    // 若 git config 没有，尝试读取环境变量兜底
    return {
        name: name ?? process.env.GIT_AUTHOR_NAME ?? null,
        email: email ?? process.env.GIT_AUTHOR_EMAIL ?? null
    }
}
