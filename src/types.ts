export type BlockType = 'text' | 'table' | 'box' | 'list';

export interface TextBlock {
  id: string;
  type: 'text';
  content: string;
}

export interface TableBlock {
  id: string;
  type: 'table';
  headers: string[];
  rows: string[][];
}

export interface BoxBlock {
  id: string;
  type: 'box';
  title: string;
  content: string;
  variant: 'info' | 'warning' | 'tip';
}

export interface ListBlock {
  id: string;
  type: 'list';
  items: string[];
  ordered: boolean;
}

export type Block = TextBlock | TableBlock | BoxBlock | ListBlock;

export interface Chapter {
  id: string;
  title: string;
  blocks: Block[];
}

export interface Book {
  title: string;
  author: string;
  chapters: Chapter[];
}
