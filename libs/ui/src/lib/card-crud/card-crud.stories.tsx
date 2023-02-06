import { ComponentStory, ComponentMeta } from '@storybook/react';
import { BrowserRouter } from 'react-router-dom';
import { CardCrud } from './card-crud';

export default {
  component: CardCrud,
  title: 'Card Crud',
} as ComponentMeta<typeof CardCrud>;

const Template: ComponentStory<typeof CardCrud> = (args) => (
  <BrowserRouter>
    <CardCrud {...args} />
  </BrowserRouter>
);

const items = [
  {
    id: '1',
    name: 'Item 1',
  },
  {
    id: '2',
    name: 'Item 2',
  },
];

export const Default = Template.bind({});
Default.args = {
  title: 'Title',
  subtitle: 'Subtitle',
  newItemName: 'Item',
  baseUrl: '/items',
  items,
  // eslint-disable-next-line no-alert
  onDelete: (id) => alert(`Delete ${id} callback`),
};

export const NoSubtitle = Template.bind({});
NoSubtitle.args = {
  title: 'Title',
  newItemName: 'Item',
  baseUrl: '/items',
  items,
  // eslint-disable-next-line no-alert
  onDelete: (id) => alert(`Delete ${id} callback`),
};

export const NoDeleteButton = Template.bind({});
NoDeleteButton.args = {
  title: 'Title',
  newItemName: 'Item',
  baseUrl: '/items',
  items,
};

export const NoNewButton = Template.bind({});
NoNewButton.args = {
  title: 'Title',
  baseUrl: '/items',
  items,
};
