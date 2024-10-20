import { hash, verify } from "@ts-rex/bcrypt";
import { err, ok, type Result } from "neverthrow";
import type { Brand } from "../../types/brand.ts";

export type HashedPassword = Brand<string, "HashedPassword">;

export class WrongHash extends Error {
  constructor() {
    super("Invalid hash");
    this.name = "WrongHash";
  }
}

export class EmptyPassword extends Error {
  constructor() {
    super("Password cannot be empty");
    this.name = "EmptyPassword";
  }
}

export class PasswordService {
  static hash(password: string): Result<HashedPassword, Error> {
    if (!password) return err(new EmptyPassword());
    return ok(hash(password) as HashedPassword);
  }

  static verify(hashedPassword: HashedPassword, password: string): Result<boolean, WrongHash> {
    try {
      return ok(verify(password, hashedPassword));
    } catch (e) {
      const error = new WrongHash();
      error.cause = e;
      return err(error);
    }
  }
}
