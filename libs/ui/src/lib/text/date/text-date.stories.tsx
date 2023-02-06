import { ComponentStory, ComponentMeta } from '@storybook/react';
import { TextDate } from './text-date';

export default {
  component: TextDate,
  title: 'Text / Date',
} as ComponentMeta<typeof TextDate>;

const Template: ComponentStory<typeof TextDate> = (args) => (
  <TextDate {...args} />
);

export const Default = Template.bind({});
Default.args = {
  date: new Date(),
};

export const DateTime = Template.bind({});
DateTime.args = {
  date: new Date(),
  display: 'dateTime',
};
