import { EventEmitter } from "node:events";
import {
  type LifecyclePhase,
  type KernelContext,
  type KernelOptions,
  type ModuleDefinition,
  type ServiceDefinition,
} from "./types.js";
import { createRNG, type RNGService } from "./rng.js";
import { createClock, type ClockService } from "./clock.js";

export class Kernel {
  #emitter = new EventEmitter();
  #phase: LifecyclePhase = "created";
  #rng: RNGService;
  #clock: ClockService;
  #modules: ModuleDefinition[];
  #services: ServiceDefinition[] = [];
  #apis: Record<string, any> = {};

  constructor(options: KernelOptions) {
    this.#modules = options.modules ?? [];
    this.#rng = createRNG(options.seed ?? Date.now());
    this.#clock = createClock((tick) =>
      this.#emitter.emit("kernel:tick", tick),
    );
    this.#emitter.setMaxListeners(0);
  }

  get phase(): LifecyclePhase {
    return this.#phase;
  }

  get rngState(): number {
    return this.#rng.getState();
  }

  set rngState(state: number) {
    this.#rng.setState(state);
  }

  get tickCount(): number {
    return this.#clock.now();
  }

  async load() {
    if (this.#phase !== "created") {
      throw new Error(
        `Kernel.load() expected phase "created", got "${this.#phase}"`,
      );
    }

    this.#phase = "loading";
    this.#emitter.emit("kernel:loading");

    for (const service of this.#services.filter((s) => s.start)) {
      if (!service.api) 
        throw new Error(
          `Trying to start an unresolved service "${service.id}"`
      )
      service.start!(service.api!, this.#buildContext(service.id));
    }

    const setups = this.#modules.map((mod) => mod.setup(this.#buildContext(mod.id)));
    await Promise.all(setups);

    this.#phase = "loaded";
    this.#emitter.emit("kernel:loaded");
  }

  start(): void {
    if (this.#phase !== "loaded") {
      throw new Error(
        `Kernel.start() expected phase "loaded", got "${this.#phase}"`,
      );
    }

    for (const mod of this.#modules.filter((m) => m.start)) {
      mod.start?.(this.#buildContext(mod.id));
    }

    this.#phase = "running";
    this.#emitter.emit("kernel:running");
  }

  destroy(): void {
    this.#emitter.emit("kernel:destroy");
    this.#emitter.removeAllListeners();
    this.#phase = "destroyed";
    this.#emitter.emit("kernel:destroyed"); // We do a little trolling
  }

  #buildContext(moduleId: string): KernelContext {
    return {
      moduleId,
      on: (event, listener) => this.#emitter.on(event, listener),
      off: (event, listener) => this.#emitter.off(event, listener),
      emit: (event, payload) => {
        this.#emitter.emit(event, payload)
      },
      rng: this.#rng,
      clock: {
        tick: () => {
          if (this.#phase != "running")
            throw new Error("No tick while not running");
          return this.#clock.tick();
        },
        now: () => this.#clock.now(),
      },
      ...this.#apis
    };
  }

  resolve(service: ServiceDefinition) {
    const descriptor = Object.create(null);
    service.api = service.create(this);
    descriptor.value = service.api; 

    this.#services.push(service);
    this.#apis[service.id] = service.api; 
    
    Object.defineProperty(this, service.id, descriptor)

    return this;
  }
}
