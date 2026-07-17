type Orientation = "up" | "down";

export class Card<TFace = unknown> {
  readonly id: string;
  readonly face: TFace;
  orientation: Orientation; // See README.md to know why it's there even if not used in every games

  constructor(id: string, face: TFace) {
    this.id = id;
    this.face = face;
    this.orientation = "down";
  }

  flip() {
    this.orientation = this.orientation === "up" ? "down" : "up";
  }
}
