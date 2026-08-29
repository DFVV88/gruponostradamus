import type { NostraGraphicSpec } from './graphic.schema';

export type NostraLevel = 'basico' | 'intermedio' | 'avanzado';
export type ChoiceId = 'A' | 'B' | 'C' | 'D' | 'E';

export interface NostraChoice {
  id: ChoiceId;
  content: string;
}

export interface NostraQuestion {
  id: string;
  course: NostraCourseId;
  topic: string;
  subtopic: string;
  concept: string;
  level: NostraLevel;
  difficulty: 1 | 2 | 3;
  skills: string[];
  prompt: string;
  choices: [NostraChoice, NostraChoice, NostraChoice, NostraChoice, NostraChoice];
  correctAnswer: ChoiceId;
  solution: string;
  feedback: string;
  graphic?: NostraGraphicSpec;
  sourceBatch?: string;
}

export type NostraCourseId =
  | 'aritmetica'
  | 'algebra'
  | 'geometria'
  | 'trigonometria'
  | 'fisica'
  | 'quimica'
  | 'razonamiento-matematico'
  | 'razonamiento-verbal';
