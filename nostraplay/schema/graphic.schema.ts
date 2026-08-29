export type NostraGraphicType =
  | 'venn'
  | 'venn3'
  | 'number-line'
  | 'interval'
  | 'cartesian-plane'
  | 'function-plot'
  | 'vector'
  | 'vector-sum'
  | 'triangle'
  | 'circle'
  | 'polygon'
  | 'geometry-diagram'
  | 'physics-diagram'
  | 'table';

export interface NostraGraphicSpec {
  type: NostraGraphicType;
  ariaLabel?: string;
  [key: string]: unknown;
}
