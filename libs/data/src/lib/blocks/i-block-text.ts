import { BlockType } from './block-type';
import { IBlock } from './i-block';

export interface IBlockText extends IBlock {
  block_type: BlockType.Text;

  data: {
    text?: string;
  };
}
