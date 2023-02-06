import { FieldType } from '../blocks';
import { IFormOption } from '../i-form-option';

export interface INodeForm {
  name: string;
  id: string;
  type: FieldType;
  options?: IFormOption[];
}
