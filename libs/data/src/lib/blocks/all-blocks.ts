import { IBlockForm } from './i-block-form';
import { IBlockDatabase } from './i-block-database';
import { IBlockText } from './i-block-text';
import type { IBlockRest } from './i-block-rest';
import { IBlockShell } from './i-block-shell';

export type AllBlocks =
  | IBlockForm
  | IBlockDatabase
  | IBlockText
  | IBlockRest
  | IBlockShell;
