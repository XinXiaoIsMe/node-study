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

export function formatResponse<TData>(data: TData, message?: string): SuccessResponse<TData>;
export function formatResponse<TDto, TData>(
  data: ReadonlyArray<TData>,
  message: string | undefined,
  DtoClass: ClassConstructor<TDto>,
): SuccessResponse<TDto[]>;
export function formatResponse<TDto, TData>(
  data: TData,
  message: string | undefined,
  DtoClass: ClassConstructor<TDto>,
): SuccessResponse<TDto>;
export function formatResponse<TDto>(data: unknown, message?: string, DtoClass?: ClassConstructor<TDto>) {
  const responseData = DtoClass ? toDto(DtoClass, data as never) : data;
  return SuccessResponse.wrap(responseData, message);
}
