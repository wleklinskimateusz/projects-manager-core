export class AlreadyExists extends Error {
  constructor(message = "resource already exists") {
    super(message);
    this.name = "AlreadyExists";
  }
}
