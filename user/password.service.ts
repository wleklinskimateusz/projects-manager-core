import { hash, verify } from "@ts-rex/bcrypt";
import { err, ok, type Result } from "neverthrow";

export class PasswordService {
  static hash(password: string): Result<string, Error> {
    if (!password) return err(new Error("Password cannot be empty"));
    return ok(hash(password));
  }

  static verify(hashedPassword: string, password: string) {
    try {
      return ok(verify(password, hashedPassword));
    } catch (e) {
      const error = new Error("Error verifying password");
      error.cause = e;
      return err(error);
    }
  }
}
