import type { Result } from "neverthrow";
import type { User } from "./user.model.ts";
import type { HashedPassword } from "./password.service.ts";

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
      User & { hashedPassword: HashedPassword },
      InternalServerError | Deno.errors.NotFound
    >
  >;

  create: (
    user: Omit<User, "id"> & { hashedPassword: HashedPassword }
  ) => Promise<Result<User, EmailAlreadyExsists | InternalServerError>>;
}
