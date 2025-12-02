
export type AspectRatio = '1:1' | '3:4' | '9:16';
export type Quality = 'standard' | 'high' | 'very_high';
export type NumberOfImages = 1 | 2 | 4;

export interface Concept {
  key: string;
  label: string;
  prompt: string;
}

export interface ConceptCategory {
  name: string;
  vibe: string;
  concepts: Concept[];
}

export interface GeneratedImage {
  id: string;
  url: string;
  seed: string;
}
