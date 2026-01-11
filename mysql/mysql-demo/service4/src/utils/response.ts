import type { ClassConstructor } from 'class-transformer';
import { toDto } from './toDto';

export class SuccessResponse<T> {
  private success = true;
  constructor(
    private readonly data: T,
    private readonly message = '操作成功',
    private readonly code = 0,
  ) {}

  static wrap<T>(data: T, message?: string) {
    return new SuccessResponse(data, message);
  }
}

export function formatResponse<T>(data: T, message?: string, DtoClass?: ClassConstructor<T>) {
  const responseData = DtoClass ? toDto(DtoClass, data) : data;
  return SuccessResponse.wrap(responseData, message);
}
