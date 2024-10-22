export class WrongId extends Error {
  constructor(cause?: unknown) {
    super("Failed to parse the id");
    if (cause) {
      this.cause = cause;
    }
  }
}
