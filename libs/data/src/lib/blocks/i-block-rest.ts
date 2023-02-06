import { BlockType } from './block-type';
import { IFormOption } from '../i-form-option';
import type { HttpMethod } from '../data';
import { IBlock } from './i-block';

export interface IBlockRest extends IBlock {
  block_type: BlockType.Rest;
  data: {
    query_parameters?: IFormOption[];
    headers?: IFormOption[];
    http_method?: HttpMethod;
    api_path?: string;
    api_provider_id?: string;
    text?: string;
  };
}
