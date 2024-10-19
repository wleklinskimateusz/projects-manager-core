import type { Brand } from "../../types/brand.ts";

export type ProjectId = Brand<string, "UserId">;

export type Project = {
  id: ProjectId;
  name: string;
  description: string;
  createdAt: Date;
  updatedAt: Date;
};
