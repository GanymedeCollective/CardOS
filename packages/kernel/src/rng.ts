export interface RNGService {
  next(): number;
  getState(): number;
  setState(state: number): void;
}

export function createRNG(seed: number): RNGService {
  let state = seed >>> 0;

  return {
    next() {
      let t = (state += 0x6d2b79f5);
      t = Math.imul(t ^ (t >>> 15), t | 1);
      t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    },
    getState(): number {
      return state;
    },
    setState(s: number): void {
      state = s >>> 0;
    },
  };
}
