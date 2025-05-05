// types/strand.ts
export interface LevelDescriptor {
  level: string;
  title: string;
  description: string;
}

export interface StrandContent {
  strandName: string;
  strandDescription: string; // ✅ Add this line
  levels: LevelDescriptor[];
}
