export class InternalServerError extends Error {
  constructor(message = "something went wrong") {
    super(message);
    this.name = "InternalServerError";
  }
}
