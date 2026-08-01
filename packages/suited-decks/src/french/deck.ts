import { Pile } from "@cardos/core";
import { FrenchCard, RANKS, SUITS } from "./card.js";

export function buildFrenchDeck(): Pile<FrenchCard> {
  const cards: FrenchCard[] = [];

  for (const suit of SUITS) {
    for (const rank of RANKS) {
      const id = `${suit}-${rank}`;
      cards.push(new FrenchCard(id, { suit, rank }));
    }
  }

  return new Pile(cards);
}
