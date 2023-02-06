import { ComponentStory, ComponentMeta } from '@storybook/react';
import { Ide } from './ide';

export default {
  component: Ide,
  title: 'IDE',
  argTypes: {
    onChange: { action: 'onChange' },
  },
} as ComponentMeta<typeof Ide>;

const Template: ComponentStory<typeof Ide> = (args) => <Ide {...args} />;

export const Default = Template.bind({});
Default.args = {
  mode: 'json',
  code: JSON.stringify({
    a: 22,
    b: 'text',
  }),
};

export const Error = Template.bind({});
Error.args = {
  mode: 'json',
  code: '{}asdf',
};

export const EmptyValue = Template.bind({});
EmptyValue.args = {
  mode: 'json',
  code: '',
};
