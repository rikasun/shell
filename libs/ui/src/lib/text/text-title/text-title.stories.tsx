import { ComponentStory, ComponentMeta } from '@storybook/react';
import { TextTitle } from './text-title';

export default {
  component: TextTitle,
  title: 'Text / Title',
} as ComponentMeta<typeof TextTitle>;

const Template: ComponentStory<typeof TextTitle> = (args) => (
  <TextTitle {...args} />
);

export const Default = Template.bind({});
Default.args = {
  children: 'My Custom title',
};

export const Large = Template.bind({});
Large.args = {
  children: 'My Custom title',
  size: 'lg',
};
