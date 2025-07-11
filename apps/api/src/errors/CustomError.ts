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
