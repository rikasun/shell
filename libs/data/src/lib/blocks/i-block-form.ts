import { BlockType } from './block-type';
import { IFormOption } from '../i-form-option';
import { IBlock } from './i-block';
import { FieldType } from './field-type';

export interface IBlockFormField {
  type: FieldType;
  name: string;
  options?: IFormOption[];
}

export interface IBlockForm extends IBlock {
  block_type: BlockType.Form;
  data: {
    form_fields?: IBlockFormField[];
  };
}
