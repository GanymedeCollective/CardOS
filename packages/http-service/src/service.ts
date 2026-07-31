import type { ServiceDefinition } from "@cardos/kernel";
import type { HttpApi, HttpServiceOptions } from "./types.js";
import express, { type Express } from "express";

export function createHttpService(
  options: HttpServiceOptions = {},
): ServiceDefinition<HttpApi> {
  const port = options.port ?? 3000;
  const host = options.host ?? "0.0.0.0";
  const id = options.name ?? "http";

  return {
    id,
    create() {
      const app: Express = express();
      return {
        get: (path, handler) => app.get(path, handler),
        post: (path, handler) => app.post(path, handler),
        __unsafeRawExpress: app,
      } as HttpApi;
    },
    start(api: HttpApi) {
      api.__unsafeRawExpress.listen(port, host);
    },
  };
}
