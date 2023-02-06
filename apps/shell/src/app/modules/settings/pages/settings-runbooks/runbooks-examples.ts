import { IListItem } from './i-list-item';

export const apiProvidersExample: IListItem[] = [
  {
    id: '1',
    name: 'AWS',
  },
  {
    id: '2',
    name: 'Azure',
  },
  {
    id: '3',
    name: 'Google Cloud',
  },
];

export const databasesExample = [...apiProvidersExample];
