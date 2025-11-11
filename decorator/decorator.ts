import { getGitUser, getGitUserSync } from './git';
import { Log, type LogEntry } from './log';

interface LogMetadata {
    version: string;
    creator: string;
    createTime: string;
}

interface PropValidator<TInstance, K extends keyof TInstance = keyof TInstance> {
    prop: K;
    message?: string;
    required?: boolean;
    validator?: (value: TInstance[K]) => [boolean, string];
}

type Constructor<TInstance> = new (...args: any[]) => TInstance;

// 添加类的创建信息
export function CreatedInfo (meta: LogMetadata) {
    return function (target: Function) {
        Reflect.defineMetadata('user:created', meta, target);
    }
}

// 添加日志功能
export function InstanceLogger (metadataKey: string) {
    const logAsync = (
        level: LogEntry['level'],
        message: LogEntry['message'],
        context?: LogEntry['context']
    ) => {
        const task = getGitUser().then(git => ({
            level,
            message,
            context,
            user: git.name
        }));
        Log.logAsync(task);
    }

    const logSync = (
        level: LogEntry['level'],
        message: LogEntry['message'],
        context?: LogEntry['context']
    ) => {
        const user = getGitUserSync().name;
        Log.logSync(
            level,
            user,
            message,
            context
        );
    }

    return function <T extends new (...args: any[]) => object> (Original: T) {
        return class extends Original {
            constructor (...args: any[]) {
                try {
                    super(...args);
                    logAsync('info', metadataKey);
                } catch (error: any) {
                    // 这里需要使用同步命令，保证日志记录完成后再抛出错误，防止日志未记录完成时，node进程就被终止。
                    const errorInfo = error instanceof Error ? error.message : String(error);
                    logSync('error', metadataKey, { errorInfo });
                    // 这里需要将错误抛出，否则引擎无法识别是否调用了super，会报错：Must call super constructor in derived class before accessing 'this' or returning from derived constructor
                    throw error;
                }
            }
        }
    }
}

// normalize化属性值，去掉字符串两侧的空格
export function NormalizeProp(target: object, propertyKey: string, descriptor: PropertyDescriptor) {
    const originalGet = descriptor.get;

    if (originalGet) {
        descriptor.get = function (this: unknown) {
            const value = originalGet.call(this);
            return value?.trim();
        }
    }
}

// 给类的属性添加校验功能
export function NonEmptyPropValidator<TCtor extends Constructor<Record<string, any>>> (
    validatorList: PropValidator<InstanceType<TCtor>>[]
) {
    return function <Ctor extends TCtor> (Original: Ctor) {
        // TypeScript 把“返回一个继承自传入构造器的新类”这种写法判定为 mixin，需要新类的构造函数参数签名完全等于 (...args: any[])，且只能有这一处参数
        return class extends Original {
            constructor (...args: any[]) {
                super(...args);

                // 由于args参数必须是any[]，为了保证类型不报错，这里断言为InstanceType<Ctor>
                const instance = this as InstanceType<Ctor>;
                for (const propValidator of validatorList) {
                    const {
                        prop,
                        message,
                        required,
                        validator
                    } = propValidator;
                    const value = instance[prop];
                    const isNonValue = value == null || value === '';

                    if (validator) {
                        const [isValid, msg] = validator(value);
                        if (!isValid) {
                            throw new Error(msg);
                        }
                    }

                    if (required && isNonValue) {
                        throw new Error(message);
                    }
                }
            }
        }
    }
}
