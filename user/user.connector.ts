import type { Result } from "neverthrow";
import type { User } from "./user.model.ts";

export class EmailAlreadyExsists extends Error {
  constructor() {
    super("Email already exists");
    this.name = "EmailAlreadyExists";
  }
}

export class InternalServerError extends Error {
  constructor(message = "something went wrong") {
    super(message);
    this.name = "InternalServerError";
  }
}

export interface UserConnector {
  getByEmail: (
    email: string
  ) => Promise<
    Result<
      User & { hashedPassword: string },
      InternalServerError | Deno.errors.NotFound
    >
  >;

  create: (
    user: Omit<User, "id"> & { hashedPassword: string }
  ) => Promise<Result<User, EmailAlreadyExsists | InternalServerError>>;
}
