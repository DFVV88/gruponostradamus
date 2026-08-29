import type { NostraQuestion, NostraCourseId } from './question.schema';
import type { NostraGraphicSpec } from './graphic.schema';

export interface NostraConceptBlock {
  id: string;
  title: string;
  body: string;
  formulas?: string[];
  graphic?: NostraGraphicSpec;
}

export interface NostraExample {
  id: string;
  title: string;
  statement: string;
  solution: string;
  graphic?: NostraGraphicSpec;
}

export interface NostraPlayUnit {
  id: string;
  course: NostraCourseId;
  topic: string;
  subtopic: string;
  title: string;
  description: string;
  version: 1;
  prerequisites: string[];
  objectives: string[];
  concepts: NostraConceptBlock[];
  examples: NostraExample[];
  questions: NostraQuestion[];
  masteryRules: {
    passPercent: number;
    unlockAdvancedPercent?: number;
  };
}
