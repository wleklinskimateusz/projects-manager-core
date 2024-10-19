import { err, ok, type Result } from "neverthrow";
import type { UserConnector } from "./user.connector.ts";
import type { User } from "./user.model.ts";
import { PasswordService } from "./password.service.ts";

export class WrongPassword extends Error {
  constructor() {
    super("Invalid password");
    this.name = "WrongPassword";
  }
}

export class UserService {
  constructor(private userConnector: UserConnector) {}

  async authenticate(
    email: string,
    password: string
  ): Promise<Result<User, Error>> {
    const user = await this.userConnector.getByEmail(email);

    if (user.isErr()) return err(user.error);

    const { hashedPassword, ...userWithoutPassword } = user.value;

    const isPasswordValid = PasswordService.verify(hashedPassword, password);

    if (isPasswordValid.isErr()) return err(isPasswordValid.error);

    if (!isPasswordValid.value) {
      return err(new WrongPassword());
    }

    return ok(userWithoutPassword);
  }

  async register(
    email: string,
    password: string
  ): Promise<Result<User, Error>> {
    const user = await this.userConnector.getByEmail(email);

    if (user.isOk()) {
      return err(new Error("Email already exists"));
    }

    const hashedPassword = PasswordService.hash(password)._unsafeUnwrap();

    return this.userConnector.create({ email, hashedPassword });
  }
}
