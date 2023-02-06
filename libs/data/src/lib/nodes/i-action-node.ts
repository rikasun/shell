import { Node } from 'react-flow-renderer';
import { IFormOption } from '../i-form-option';
import { HttpMethod } from './http-methods';
import { INodeForm } from './i-node-form';

export interface INodeActionData {
  name?: string;

  markdown?: {
    content?: string;
  };

  shell?: {
    prompt: string;
    text: string;
  };

  database?: {
    databaseServer: string;
    text: string;
  };

  api?: {
    providerId: string;
    httpMethod?: HttpMethod;
    path: string;
    headers: IFormOption[];
    queryParameters: IFormOption[];
  };

  form?: INodeForm[];

  handleBeginHide?: boolean;
  handleEndHide?: boolean;
  selected?: boolean;
}

export type INodeAction = Node<INodeActionData>;
