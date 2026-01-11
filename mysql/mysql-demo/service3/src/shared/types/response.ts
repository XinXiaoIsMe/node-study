export type SuccessResponse<T> = Promise<{
  data: T;
  code: number;
  success: boolean;
  message: string;
}>;
