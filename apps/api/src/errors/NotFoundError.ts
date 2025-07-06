export class NotFoundError extends Error {
  status?: number;

  constructor(message = "Data not found") {
    super(message);
    this.status = 404;
  }
}
