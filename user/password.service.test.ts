import { describe, it } from "@std/testing/bdd";
import { PasswordService } from "./password.service.ts";
import { expect } from "jsr:@std/expect";

describe("PasswordService", () => {
  it("shouldn't allow empty passwords", () => {
    const hashedPassword = PasswordService.hash("");

    expect(hashedPassword.isErr()).toBe(true);
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
    const verifyResult = PasswordService.verify("wrong-hash", "password");

    expect(verifyResult.isErr()).toBe(true);
  });
});
