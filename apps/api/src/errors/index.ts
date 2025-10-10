export class CustomError extends Error {
  status?: number;
  cause?: Error;

  constructor(message: string, status = 500, options?: { cause?: Error }) {
    super(message);
    this.status = status;
    if (options?.cause) {
      this.cause = options.cause;
    }
  }
}

export class NotFoundError extends Error {
  status?: number;

  constructor(message = "Data not found") {
    super(message);
    this.status = 404;
  }
}

export class BadRequestError extends Error {
  status?: number;

  constructor(message = "Bad Request") {
    super(message);
    this.status = 400;
  }
}
