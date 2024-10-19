import { describe, it } from "@std/testing/bdd";
import {
  EmptyPassword,
  PasswordService,
  WrongHash,
  type HashedPassword,
} from "./password.service.ts";
import { expect } from "jsr:@std/expect";

describe("PasswordService", () => {
  it("shouldn't allow empty passwords", () => {
    const hashedPassword = PasswordService.hash("");

    if (hashedPassword.isOk()) throw new Error("Password should be empty");

    expect(hashedPassword.error).toBeInstanceOf(EmptyPassword);
  });

  it("should hash a password", () => {
    const hashedPassword = PasswordService.hash("password");

    if (hashedPassword.isErr()) throw new Error("Password should be hashed");

    const verifyResult = PasswordService.verify(
      hashedPassword.value,
      "password"
    );

    if (verifyResult.isErr()) throw new Error("Password should be verified");

    expect(verifyResult.value).toBe(true);
  });

  it("shouldn't verify a wrong password", () => {
    const hashedPassword = PasswordService.hash("password");

    if (hashedPassword.isErr()) throw new Error("Password should be hashed");

    const verifyResult = PasswordService.verify(
      hashedPassword.value,
      "wrong-password"
    );

    if (verifyResult.isErr()) throw new Error("Password should be verified");

    expect(verifyResult.value).toBe(false);
  });

  it("should return error if wrong hash is passed", () => {
    const verifyResult = PasswordService.verify(
      "wrong-hash" as HashedPassword,
      "password"
    );

    if (verifyResult.isOk()) throw new Error("Password should be verified");

    expect(verifyResult.error).toBeInstanceOf(WrongHash);
  });
});
