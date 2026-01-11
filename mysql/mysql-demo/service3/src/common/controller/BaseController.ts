const SUCCESS_MESSAGE = '操作成功';

export abstract class BaseController {
  ok <T>(data: T, message = SUCCESS_MESSAGE) {
    return {
      code: 0,
      success: true,
      data,
      message,
    };
  }
}
