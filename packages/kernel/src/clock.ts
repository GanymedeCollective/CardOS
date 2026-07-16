export interface ClockService {
  tick(): number;
  now(): number;
}

export function createClock(emitTick: (tick: number) => void): ClockService {
  let current = 0;

  return {
    tick(): number {
      current += 1;
      emitTick(current);
      return current;
    },
    now(): number {
      return current;
    },
  };
}
