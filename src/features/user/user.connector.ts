import type { Result } from "neverthrow";
import type { User, UserId } from "./user.model.ts";
import type { HashedPassword } from "./password.service.ts";
import type { InternalServerError } from "../../errors/internal-server-error.ts";
import type { AlreadyExists } from "../../errors/already-exists.ts";

export interface UserConnector {
  getByEmail: (
    email: string,
  ) => Promise<
    Result<
      User & { hashedPassword: HashedPassword },
      InternalServerError | Deno.errors.NotFound
    >
  >;

  create: (
    user: Omit<User, "id"> & { hashedPassword: HashedPassword },
  ) => Promise<Result<UserId, AlreadyExists | InternalServerError>>;
}
