import { Card, Pile } from "@cardos/core";
import { RANKS, SUITS, type FrenchFace } from "./face.js";

export function buildFrenchDeck(): Pile<Card<FrenchFace>> {
  const cards: Card<FrenchFace>[] = [];

  for (const suit of SUITS) {
    for (const rank of RANKS) {
      const id = `${suit}-${rank}`;
      cards.push(new Card<FrenchFace>(id, { suit, rank }));
    }
  }

  return new Pile(cards);
}
