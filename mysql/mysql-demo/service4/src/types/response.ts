import type { ClassConstructor } from 'class-transformer';
import type { SuccessResponse } from '@/utils';

export type ResponseData<T, D = unknown> = T extends ClassConstructor<D> ? SuccessResponse<D> : SuccessResponse<T>;
