import { BlockType } from './block-type';

export interface IBlock {
  id?: number;
  name?: string;
  block_type?: BlockType;
  runbook_id?: string;
  sort_order?: number;
  data: unknown;
}
