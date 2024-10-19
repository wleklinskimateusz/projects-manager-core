import type { Brand } from "../../types/brand.ts";

export type UserId = Brand<string, "UserId">;

export type User = {
  id: UserId;
  email: string;
};
