export const SKIPHOOK = Symbol("hook:skip")
export type HookListener<TPayload, TResponse> = (payload: TPayload) => TResponse | typeof SKIPHOOK | Promise<TResponse | typeof SKIPHOOK>;

export interface BailHook<TPayload, TResponse> { // Will bail on first response
  tap(listener: HookListener<TPayload, TResponse>): () => void;
  call(payload: TPayload): Promise<TResponse | typeof SKIPHOOK>;
}

export interface SeriesHook<TPayload, TResponse> { // Will listen to everyone before bailing
  tap(listener: HookListener<TPayload, TResponse>): () => void;
  call(payload: TPayload): Promise<Array<{ listenerId: string; result: TResponse }>>;
}

export function createBailHook<TPayload, TResponse>(): BailHook<TPayload, TResponse> {
    const listeners = new Set<HookListener<TPayload, TResponse>>();
  
    return {
      tap(listener) {
        listeners.add(listener);
        return () => listeners.delete(listener);
      },
      async call(payload) {
        for (const listener of [...listeners]) {
          const result = await listener(payload);
          if (result !== SKIPHOOK) return result;
        }
        return SKIPHOOK;
      },
    };
}
  
export  function createSeriesHook<TPayload, TResponse>(): SeriesHook<TPayload, TResponse> {
    const listeners = new Map<string, HookListener<TPayload, TResponse>>();
  
    return {
      tap(listener) {
        const id = crypto.randomUUID();
        listeners.set(id, listener);
        return () => listeners.delete(id);
      },
      async call(payload) {
        const results: Array<{ listenerId: string; result: TResponse }> = [];
        for (const [listenerId, listener] of listeners) {
          const result = await listener(payload);
          if (result !== SKIPHOOK) results.push({ listenerId, result });
        }
        return results;
      },
    };
  }