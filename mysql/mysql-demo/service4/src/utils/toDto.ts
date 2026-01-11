import type { ClassConstructor } from 'class-transformer';
import { plainToInstance } from 'class-transformer';

/**
 * 将数据转化符合dto类的格式
 * @param DtoClass dto类
 * @param data 数据
 */
export function toDto<TDto, TPlain>(DtoClass: ClassConstructor<TDto>, data: ReadonlyArray<TPlain>): TDto[];
export function toDto<TDto, TPlain>(DtoClass: ClassConstructor<TDto>, data: TPlain): TDto;
export function toDto<TDto, TPlain>(
  DtoClass: ClassConstructor<TDto>,
  data: TPlain | ReadonlyArray<TPlain> | null | undefined,
) {
  if (data === null || data === undefined) {
    return data;
  }

  return plainToInstance(DtoClass, data, {
    excludeExtraneousValues: true,
  });
}
