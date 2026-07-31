import type { Kernel } from "./kernel.js";
import type { RNGService } from "./rng.js";

export type LifecyclePhase =
  "created" | "loading" | "loaded" | "running" | "destroyed";

export type Listener<T> = (payload: T) => void;

export interface KernelContext {
  readonly moduleId: string;
  on<T = unknown>(event: string, listener: Listener<T>): void;
  off<T = unknown>(event: string, listener: Listener<T>): void;
  emit<T = unknown>(event: string, payload?: T): void;
  rng: RNGService;
  clock: {
    tick(): number;
    now(): number;
  };
}

export interface ModuleDefinition {
  id: string;
  setup(kernel: KernelContext): Promise<void>;
  start?(kernel: KernelContext): void;
}


export interface ServiceDefinition<TApi = unknown> {
  id: string;
  create(kernel: Kernel): TApi;
  start?(api: TApi, kernel: KernelContext): void;
  destroy?(api: TApi): void;
  api?: TApi;
}

export interface KernelOptions {
  modules?: ModuleDefinition[];
  seed?: number;
}
