import { createWriteStream } from 'fs';
import path from 'path';
import { getGitUserSync } from './git';

export type LogLevel = 'debug' | 'info' | 'warn' | 'error';

export interface LogEntry {
    user: string | null;
    timestamp: string;
    level: LogLevel;
    message: string;
    context: Record<string, unknown> | undefined;
}

// 追踪所有异步写入，保证进程退出前 flush
const pendingLogs = new Set<Promise<void>>();

// 这里不能图方便将git信息的获取也写入JsonLogger中，会造成JsonLogger功能不纯粹，user信息和git信息绑定
// 后续如果需要定制user信息，无法修改
export class JsonLogger {
    private stream = createWriteStream(path.join(process.cwd(), 'app.log'), {
        flags: 'a',
        encoding: 'utf8'
    })

    logAsync(task: Promise<Omit<LogEntry, 'timestamp'>>) {
        const promise = task
            .then(entry => {
                this.logSync(entry.level, entry.user, entry.message, entry.context);
            })
            .finally(() => pendingLogs.delete(promise));
        pendingLogs.add(promise);
        return promise;
    }

    logSync(
        level: LogLevel,
        user: string | null,
        message: string,
        context?: Record<string, unknown>
    ) {
        const entry: LogEntry = {
            timestamp: new Date().toISOString(),
            user,
            level,
            message,
            context
        };
        this.stream.write(`${JSON.stringify(entry)}\n`);
    }

    async flush() {
        if (pendingLogs.size === 0) return;
        await Promise.all([...pendingLogs]);
    }
}

export const Log = new JsonLogger();

const flushAndExit = async (code: number) => {
    try {
        await Log.flush();
    } finally {
        process.exit(code);
    }
}

process.once('uncaughtException', async error => {
    console.log('uncaughtException')
    const user = getGitUserSync().name;
    // 捕获异常，记录日志
    Log.logSync('error', user, 'uncaught exception', { errorInfo: error.message });
    // 刷新日志任务，保证所有异步日志任务都被执行完
    await flushAndExit(1);
});

process.once('unhandledRejection', async reason => {
    console.log('unhandledRejection')
    const user = getGitUserSync().name;
    Log.logSync('error', user, 'unhandled rejection', { errorInfo: String(reason) });
    await flushAndExit(1);
});

process.once('beforeExit', async () => {
    console.log('beforeExit')
    await Log.flush();
});
