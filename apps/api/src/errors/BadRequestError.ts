export class BadRequestError extends Error {
  status?: number;

  constructor(message = "Bad Request") {
    super(message);
    this.status = 400;
  }
}
