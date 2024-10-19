import type { Result } from "neverthrow";

export type Project = {
  id: string;
  name: string;
  description: string;
};

export interface ProjectsConnector {
  getAll: () => Promise<Result<Project[], Error>>;
  getById: (id: Project["id"]) => Promise<Result<Project, Error>>;
  create: (project: Project) => Promise<Result<void, Error>>;
  update: (project: Project) => Promise<Result<void, Error>>;
  delete: (id: Project["id"]) => Promise<Result<void, Error>>;
}

export class App {
  constructor() {
    console.log("Hello from App!");
  }

  run() {}
}
