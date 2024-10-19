import type { Result } from "neverthrow";
import type { Project } from "./project.model.ts";
import type { InternalServerError } from "../../errors/internal-server-error.ts";
import type { UserId } from "../user/user.model.ts";
import type { AlreadyExists } from "../../errors/already-exists.ts";

type ResultType<T, Errors extends never | Error = never> = Result<T, InternalServerError | Errors>;

export abstract class ProjectConnector {
  abstract getById(id: Project["id"], userId: UserId): Promise<ResultType<Project, Deno.errors.NotFound>>;
  abstract getAll(userId: UserId): Promise<ResultType<Project[]>>;
  abstract create(project: Omit<Project, "id">, userId: UserId): Promise<ResultType<void, AlreadyExists>>;
  abstract update(project: Project, userId: UserId): Promise<ResultType<void>>;
  abstract delete(id: Project["id"]): Promise<ResultType<void>>;
}
