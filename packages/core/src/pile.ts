interface RandomizationContract {
  next(): number;
}

export class Pile<T> {
  readonly #items: T[];

  get size(): number {
    return this.#items.length;
  }

  constructor(items: T[] = []) {
    this.#items = [...items];
  }

  push(item: T, position: number) {
    this.#items.splice(position, 0, item);
  }

  draw(position: number): T | undefined {
    return this.#items.splice(position, 1)[0];
  }

  peek(n?: number): readonly T[] {
    return this.#items.slice(0, n);
  }

  shuffle(rng: RandomizationContract): void {
    for (let i = this.#items.length - 1; i > 0; i--) {
      const j = Math.floor(rng.next() * (i + 1));
      [this.#items[i], this.#items[j]] = [this.#items[j]!, this.#items[i]!];
    }
  }
}
