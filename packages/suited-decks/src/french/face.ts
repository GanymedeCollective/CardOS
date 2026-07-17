export const SUITS = ["hearts", "diamonds", "clubs", "spades"] as const;

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
