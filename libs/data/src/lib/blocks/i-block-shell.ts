import { BlockType } from './block-type';
import { IBlock } from './i-block';

export interface IBlockShell extends IBlock {
  block_type: BlockType.Shell;

  data: {
    command?: string;
    prompt?: string;
  };
}
