import type { ClassConstructor } from 'class-transformer';
import { plainToInstance } from 'class-transformer';

/**
 * 将数据转化符合dto类的格式
 * @param DtoClass dto类
 * @param data 数据
 */
export function toDto<T, D>(DtoClass: ClassConstructor<T>, data: D) {
  return plainToInstance(DtoClass, data, {
    excludeExtraneousValues: true,
  });
}
