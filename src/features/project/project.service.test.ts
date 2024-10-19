import { describe, it } from "@std/testing/bdd";
import { ProjectService } from "./project.service.ts";
import { expect } from "jsr:@std/expect";
import { ProjectConnector } from "./project.connector.ts";
import type { UserId } from "../user/user.model.ts";
import { err, ok } from "neverthrow";
import type { Project, ProjectId } from "./project.model.ts";
import { InternalServerError } from "../../errors/internal-server-error.ts";

class ProjectConnectorMock extends ProjectConnector {
  private readonly project = {
    id: "1" as ProjectId,
    name: "Project",
    description: "Description",
    createdAt: new Date(),
    updatedAt: new Date(),
  } satisfies Project;

  override getById(_id: Project["id"], _userId: UserId): ReturnType<ProjectConnector["getById"]> {
    return Promise.resolve(ok(this.project));
  }
  override getAll(_userId: UserId): ReturnType<ProjectConnector["getAll"]> {
    return Promise.resolve(ok([this.project]));
  }
  override create(_project: Omit<Project, "id">, _userId: UserId): ReturnType<ProjectConnector["create"]> {
    return Promise.resolve(ok(this.project));
  }
  override update(_project: Project, _userId: UserId): ReturnType<ProjectConnector["update"]> {
    return Promise.resolve(ok(undefined));
  }
  override delete(_id: Project["id"]): ReturnType<ProjectConnector["delete"]> {
    return Promise.resolve(ok(undefined));
  }
}

describe("ProjectService", () => {
  describe("create", () => {
    it("should create a project", async () => {
      let wasCreated = false;
      class CreateProjectConnector extends ProjectConnectorMock {
        override create(
          project: Omit<Project, "id">,
          userId: UserId,
        ) {
          wasCreated = true;
          return super.create(project, userId);
        }
      }

      const projectConnector = new CreateProjectConnector();

      const projectService = new ProjectService(projectConnector, "1" as UserId);
      const result = await projectService.create({ name: "Project", description: "Description" });

      if (result.isErr()) throw new Error("Project should be created");

      expect(result.value).toEqual({
        id: "1",
        name: "Project",
        description: "Description",
        createdAt: expect.any(Date),
        updatedAt: expect.any(Date),
      });

      expect(wasCreated).toBe(true);
    });

    it("should return an error if the project could not be created", async () => {
      class CreateProjectConnector extends ProjectConnectorMock {
        override create(
          _project: Omit<Project, "id">,
          _userId: UserId,
        ): ReturnType<ProjectConnector["create"]> {
          return Promise.resolve(err(new InternalServerError()));
        }
      }

      const projectConnector = new CreateProjectConnector();

      const projectService = new ProjectService(projectConnector, "1" as UserId);
      const result = await projectService.create({ name: "Project", description: "Description" });

      if (result.isOk()) throw new Error("Project should not be created");

      expect(result.error).toBeInstanceOf(InternalServerError);
    });
  });

  describe("update", () => {
    it("should update a project", async () => {
      let wasUpdated = false;
      class UpdateProjectConnector extends ProjectConnectorMock {
        override update(project: Project, userId: UserId) {
          wasUpdated = true;
          return super.update(project, userId);
        }
      }

      const projectConnector = new UpdateProjectConnector();

      const projectService = new ProjectService(projectConnector, "1" as UserId);
      const result = await projectService.update({
        id: "1" as ProjectId,
        name: "Project",
        description: "Description",
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      if (result.isErr()) throw new Error("Project should be updated");

      expect(wasUpdated).toBe(true);
    });

    it("should return an error if the project could not be updated", async () => {
      class UpdateProjectConnector extends ProjectConnectorMock {
        override update(_project: Project, _userId: UserId): ReturnType<ProjectConnector["update"]> {
          return Promise.resolve(err(new InternalServerError()));
        }
      }

      const projectConnector = new UpdateProjectConnector();

      const projectService = new ProjectService(projectConnector, "1" as UserId);
      const result = await projectService.update({
        id: "1" as ProjectId,
        name: "Project",
        description: "Description",
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      if (result.isOk()) throw new Error("Project should not be updated");

      expect(result.error).toBeInstanceOf(InternalServerError);
    });
  });

  describe("delete", () => {
    it("should delete a project", async () => {
      let wasDeleted = false;
      class DeleteProjectConnector extends ProjectConnectorMock {
        override delete(id: Project["id"]) {
          wasDeleted = true;
          return super.delete(id);
        }
      }

      const projectConnector = new DeleteProjectConnector();

      const projectService = new ProjectService(projectConnector, "1" as UserId);
      const result = await projectService.delete("1" as ProjectId);

      if (result.isErr()) throw new Error("Project should be deleted");

      expect(wasDeleted).toBe(true);
    });

    it("should return an error if the project could not be deleted", async () => {
      class DeleteProjectConnector extends ProjectConnectorMock {
        override delete(_id: Project["id"]): ReturnType<ProjectConnector["delete"]> {
          return Promise.resolve(err(new InternalServerError()));
        }
      }

      const projectConnector = new DeleteProjectConnector();

      const projectService = new ProjectService(projectConnector, "1" as UserId);
      const result = await projectService.delete("1" as ProjectId);

      if (result.isOk()) throw new Error("Project should not be deleted");

      expect(result.error).toBeInstanceOf(InternalServerError);
    });
  });

  describe("getById", () => {
    it("should get a project by id", async () => {
      const projectConnector = new ProjectConnectorMock();

      const projectService = new ProjectService(projectConnector, "1" as UserId);
      const result = await projectService.getById("1" as ProjectId);

      if (result.isErr()) throw new Error("Project should be found");

      expect(result.value).toEqual({
        id: "1",
        name: "Project",
        description: "Description",
        createdAt: expect.any(Date),
        updatedAt: expect.any(Date),
      });
    });

    it("should return an error if the project could not be found", async () => {
      class GetByIdProjectConnector extends ProjectConnectorMock {
        override getById(_id: Project["id"], _userId: UserId): ReturnType<ProjectConnector["getById"]> {
          return Promise.resolve(err(new InternalServerError()));
        }
      }

      const projectConnector = new GetByIdProjectConnector();

      const projectService = new ProjectService(projectConnector, "1" as UserId);
      const result = await projectService.getById("1" as ProjectId);

      if (result.isOk()) throw new Error("Project should not be found");

      expect(result.error).toBeInstanceOf(InternalServerError);
    });
  });

  describe("getAll", () => {
    it("should get all projects", async () => {
      const projectConnector = new ProjectConnectorMock();

      const projectService = new ProjectService(projectConnector, "1" as UserId);
      const result = await projectService.getAll();

      if (result.isErr()) throw new Error("Projects should be found");

      expect(result.value).toEqual([
        {
          id: "1",
          name: "Project",
          description: "Description",
          createdAt: expect.any(Date),
          updatedAt: expect.any(Date),
        },
      ]);
    });

    it("should return an error if the projects could not be found", async () => {
      class GetAllProjectConnector extends ProjectConnectorMock {
        override getAll(_userId: UserId): ReturnType<ProjectConnector["getAll"]> {
          return Promise.resolve(err(new InternalServerError()));
        }
      }

      const projectConnector = new GetAllProjectConnector();

      const projectService = new ProjectService(projectConnector, "1" as UserId);
      const result = await projectService.getAll();

      if (result.isOk()) throw new Error("Projects should not be found");

      expect(result.error).toBeInstanceOf(InternalServerError);
    });
  });
});
