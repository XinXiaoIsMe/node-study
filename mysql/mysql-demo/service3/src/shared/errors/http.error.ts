export class HttpError extends Error {
  constructor (
    public code: number,
    message: string,
    public errors?: unknown
   ) {
    super(message);
   }
}