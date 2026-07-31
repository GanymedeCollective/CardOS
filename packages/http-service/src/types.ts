import type { KernelContext } from "@cardos/kernel";
import { type Express, type Request, type Response } from "express";


export interface HttpApi {
  get(path: string, handler: (req: Request, res: Response) => void): void;
  post(path: string, handler: (req: Request, res: Response) => void): void;
  __unsafeRawExpress: Express;
}

export type HttpKernelContext = KernelContext & {
  http: HttpApi
};

export interface HttpServiceOptions {
  port?: number;
  host?: string;
  name?: string;
}