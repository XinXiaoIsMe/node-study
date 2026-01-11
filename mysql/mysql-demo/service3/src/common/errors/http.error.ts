export interface HttpErrorOptions {
  errorCode?: string | number;
  message?: string;
  details?: any;
}

export class HttpError extends Error {
  statusCode: number;
  errorCode?: string | number;
  details?: any;

  constructor(statusCode: number, options: HttpErrorOptions = {}) {
    super(options.message);
    this.statusCode = statusCode;
    this.errorCode = options.errorCode;
    this.details = options.details;
    this.name = this.constructor.name;

    // -----------------------------
    // 修复 TypeScript / Babel 下继承内置 Error 的原型链问题
    // -----------------------------
    // 在 ES5/TS 编译为 ES5 的情况下，继承 Error 时，
    // 通过 super() 创建的实例的原型链指向 Error 而不是 HttpError，
    // 导致 `instanceof HttpError` 返回 false。
    // 通过 Object.setPrototypeOf，将实例的原型设置为当前类的 prototype，
    // 保证 instanceof 检查和原型链访问正常。
    Object.setPrototypeOf(this, new.target.prototype);

    // -----------------------------
    // 捕获堆栈并去掉构造函数内部调用的冗余行
    // -----------------------------
    // Error.captureStackTrace 可以生成清晰的堆栈，
    // 并且通过第二个参数（this.constructor）去掉构造函数内部的 super() 调用行，
    // 让堆栈直接显示错误发生的位置，更利于调试和生产排查。
    Error.captureStackTrace(this, this.constructor);
  }
}
