export enum TiledLLMAreas {
  A1,
  A2,
  A3,
  A4,
  B1,
  B2,
  B3,
  B4,
}

export interface LLMArea {
  name: string;
  handler?: (area: LLMArea) => void;
}
