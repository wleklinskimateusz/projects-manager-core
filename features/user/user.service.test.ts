// deno-lint-ignore-file require-await
import { describe, it } from "jsr:@std/testing/bdd";
import { expect } from "jsr:@std/expect";
import { UserService, WrongPassword } from "./user.service.ts";
import { err, ok, type Result } from "neverthrow";
import {
  EmailAlreadyExsists,
  InternalServerError,
  type UserConnector,
} from "./user.connector.ts";
import {
  EmptyPassword,
  PasswordService,
  WrongHash,
  type HashedPassword,
} from "./password.service.ts";
import type { User } from "./user.model.ts";
import * as uuid from "jsr:@std/uuid";

abstract class UserConnectorMock implements UserConnector {
  async getByEmail(
    _email: string
  ): Promise<Result<User & { hashedPassword: HashedPassword }, Error>> {
    return ok({} as User & { hashedPassword: HashedPassword });
  }

  async create(
    _user: Parameters<UserConnector["create"]>[0]
  ): Promise<Result<User, InternalServerError | EmailAlreadyExsists>> {
    return ok({} as User);
  }
}

describe("UserService", () => {
  describe("authentication", () => {
    it("should authenticate a user", async () => {
      const password = "password";
      const hashedPassword = PasswordService.hash(password)._unsafeUnwrap();

      class ValidUserConnector
        extends UserConnectorMock
        implements UserConnector
      {
        override getByEmail(email: string) {
          return Promise.resolve(ok({ id: "1", email, hashedPassword }));
        }
      }

      const userConnector = new ValidUserConnector();
      const userService = new UserService(userConnector);
      const result = await userService.authenticate("email", password);

      if (result.isErr())
        throw new Error("User should be authenticated", result.error);

      expect(result.value).toEqual({
        id: expect.any(String),
        email: "email",
      });
    });

    it("shouldn't authenticate a user with wrong password", async () => {
      const password = "password";
      const hashedPassword = PasswordService.hash(password)._unsafeUnwrap();

      class InvalidUserConnector extends UserConnectorMock {
        override getByEmail(email: string) {
          return Promise.resolve(ok({ id: "1", email, hashedPassword }));
        }
      }

      const userConnector = new InvalidUserConnector();
      const userService = new UserService(userConnector);
      const result = await userService.authenticate("email", "wrong-password");

      if (result.isOk()) throw new Error("User should not be authenticated");

      expect(result.error).toBeInstanceOf(WrongPassword);
    });

    it("should return an error if user doesn't exist", async () => {
      class NotExistingUserConnector extends UserConnectorMock {
        override async getByEmail(_email: string) {
          return err(new Deno.errors.NotFound("user not found"));
        }
      }

      const userConnector = new NotExistingUserConnector();
      const userService = new UserService(userConnector);
      const result = await userService.authenticate("email", "password");

      if (result.isOk()) throw new Error("User should not be authenticated");

      expect(result.error).toBeInstanceOf(Deno.errors.NotFound);
    });

    it("should return error if user connector returns invalid hash", async () => {
      class InvalidHashUserConnector extends UserConnectorMock {
        override async getByEmail(_email: string) {
          return ok({
            id: "1",
            email: "email",
            hashedPassword: "invalid-hash" as HashedPassword,
          });
        }
      }

      const userConnector = new InvalidHashUserConnector();
      const userService = new UserService(userConnector);
      const result = await userService.authenticate("email", "password");

      if (result.isOk()) throw new Error("User should not be authenticated");

      expect(result.error).toBeInstanceOf(WrongHash);
    });

    it("should pass an error from connector", async () => {
      const errorMessage = "something went wrong";
      class ErrorUserConnector extends UserConnectorMock {
        override async getByEmail() {
          return err(new InternalServerError(errorMessage));
        }
      }

      const userConnector = new ErrorUserConnector();
      const userService = new UserService(userConnector);
      const result = await userService.authenticate("email", "password");

      if (result.isOk()) throw new Error("User should not be authenticated");

      expect(result.error).toBeInstanceOf(InternalServerError);
      expect(result.error.message).toBe(errorMessage);
    });
  });

  describe("register", () => {
    class UserConnectorFake implements UserConnector {
      constructor(
        private users: (User & { hashedPassword: HashedPassword })[] = []
      ) {}

      async getByEmail(email: string) {
        const user = this.users.find((u) => u.email === email);

        if (!user) return err(new Deno.errors.NotFound("user not found"));

        return ok(user);
      }

      async create(
        user: Omit<User, "id"> & { hashedPassword: HashedPassword }
      ) {
        const exists = this.users.some((u) => u.email === user.email);

        if (exists) return err(new EmailAlreadyExsists());

        const userWithId = {
          ...user,
          id: uuid.v1.generate(),
        };

        this.users.push(userWithId);

        return ok((await this.getByEmail(user.email))._unsafeUnwrap());
      }
    }

    it("should create a user", async () => {
      const userConnector = new UserConnectorFake();
      const userService = new UserService(userConnector);
      const result = await userService.register("email", "password");

      if (result.isErr()) throw new Error("User should be created");
    });

    it("should return an error if user already exists", async () => {
      const userConnector = new UserConnectorFake([
        {
          id: "1",
          email: "email",
          hashedPassword: "password" as HashedPassword,
        },
      ]);
      const userService = new UserService(userConnector);
      const result = await userService.register("email", "different password");

      if (result.isOk()) throw new Error("User should not be created");

      expect(result.error).toBeInstanceOf(EmailAlreadyExsists);
    });

    it("should return an error if password is empty", async () => {
      const userConnector = new UserConnectorFake();
      const userService = new UserService(userConnector);
      const result = await userService.register("email", "");

      if (result.isOk()) throw new Error("User should not be created");

      expect(result.error).toBeInstanceOf(EmptyPassword);
    });

    it("should pass an error from connector", async () => {
      const errorMessage = "something went wrong";
      class ErrorUserConnector extends UserConnectorMock {
        override async create() {
          return err(new InternalServerError(errorMessage));
        }
      }

      const userConnector = new ErrorUserConnector();
      const userService = new UserService(userConnector);
      const result = await userService.register("email", "password");

      if (result.isOk()) throw new Error("User should not be created");

      expect(result.error).toBeInstanceOf(InternalServerError);
      expect(result.error.message).toBe(errorMessage);
    });
  });
});
