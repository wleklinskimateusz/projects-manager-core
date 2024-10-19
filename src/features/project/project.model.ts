import type { Brand } from "../../types/brand.ts";

export type ProjectId = Brand<string, "ProjectId">;

export type Project = {
  id: ProjectId;
  name: string;
  description: string;
  createdAt: Date;
  updatedAt: Date;
};
