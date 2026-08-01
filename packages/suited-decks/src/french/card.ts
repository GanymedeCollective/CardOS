import { Card } from "@cardos/core";

export const SUITS = ["hearts", "diamonds", "clubs", "spades"] as const;

type SuitOrder = Record<'conventional' | 'custom', Suit[]>;
const suitOrders: SuitOrder = {
  conventional: ["hearts", "diamonds", "clubs", "spades"],
  custom: ["diamonds", "clubs", "hearts", "spades"],
};

export type Suit = (typeof SUITS)[number];

export const RANKS = [
  "2",
  "3",
  "4",
  "5",
  "6",
  "7",
  "8",
  "9",
  "10",
  "J",
  "Q",
  "K",
  "A",
];

export type Rank = (typeof RANKS)[number];

export interface FrenchFace {
  suit: Suit;
  rank: Rank;
}

export class FrenchCard extends Card<FrenchFace> {
  constructor(id: string, face: FrenchFace) {
    super(id, face);
  }

  get rank(): Rank {
    return this.face.rank;
  }

  get suit(): Suit {
    return this.face.suit;
  }

  compareRanks(other: FrenchCard): number {
    const rankA = RANKS.indexOf(this.rank);
    const rankB = RANKS.indexOf(other.rank);
    return rankA - rankB;
  }

  compareSuits(order: Suit[] | keyof SuitOrder): (other: FrenchCard) => number {
    const orderIndex = order as keyof SuitOrder
    if (orderIndex in Object.keys(suitOrders)) {
      return (other: FrenchCard) => {
        const suitA = suitOrders[orderIndex].indexOf(this.suit);
        const suitB = suitOrders[orderIndex].indexOf(other.suit);
        return suitA - suitB;
      }; 
    }
    return (other: FrenchCard) => {
      const suitA = order.indexOf(this.suit);
      const suitB = order.indexOf(other.suit);
      return suitA - suitB;
    };
  }
}