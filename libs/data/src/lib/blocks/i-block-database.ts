import { BlockType } from './block-type';
import { IBlock } from './i-block';

export interface IBlockDatabase extends IBlock {
  block_type: BlockType.Database;
  data: {
    query?: string;
    database_id?: string;
  };
}
