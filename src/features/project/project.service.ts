import type { Project } from "./project.model.ts";
import type { ProjectConnector } from "./project.connector.ts";
import type { UserId } from "../user/user.model.ts";

export class ProjectService {
  constructor(
    private projectConnector: ProjectConnector,
    private user: UserId,
  ) {}

  create(
    project: Omit<Project, "id" | "createdAt" | "updatedAt">,
  ): ReturnType<ProjectConnector["create"]> {
    return this.projectConnector.create(
      { ...project, createdAt: new Date(), updatedAt: new Date() },
      this.user,
    );
  }

  update(project: Project): ReturnType<ProjectConnector["update"]> {
    return this.projectConnector.update(project, this.user);
  }

  delete(id: Project["id"]): ReturnType<ProjectConnector["delete"]> {
    return this.projectConnector.delete(id);
  }

  getById(id: Project["id"]): ReturnType<ProjectConnector["getById"]> {
    return this.projectConnector.getById(id, this.user);
  }

  getAll(): ReturnType<ProjectConnector["getAll"]> {
    return this.projectConnector.getAll(this.user);
  }
}
