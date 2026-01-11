import type { HttpErrorOptions } from './http.error';
import { HttpError } from './http.error';

export { HttpError };

export class BadRequestError extends HttpError {
  constructor(options: HttpErrorOptions = {}) {
    super(400, options);
  }
}

export class UnauthorizedError extends HttpError {
  constructor(options: HttpErrorOptions = {}) {
    super(401, options);
  }
}

export class ForbiddenError extends HttpError {
  constructor(options: HttpErrorOptions = {}) {
    super(403, options);
  }
}

export class NotFoundError extends HttpError {
  constructor(options: HttpErrorOptions = {}) {
    super(404, options);
  }
}

export class InternalServerError extends HttpError {
  constructor(options: HttpErrorOptions = {}) {
    super(500, options);
  }
}
