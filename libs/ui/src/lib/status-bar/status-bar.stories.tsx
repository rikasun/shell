import { ComponentStory, ComponentMeta } from '@storybook/react';
import { StatusBar } from './status-bar';

export default {
  component: StatusBar,
  title: 'Status Bar',
  argTypes: {
    state: {
      options: ['loading', 'error'],
      control: { type: 'radio' },
    },
  },
} as ComponentMeta<typeof StatusBar>;

const Template: ComponentStory<typeof StatusBar> = (args) => (
  <StatusBar {...args} />
);

export const Loading = Template.bind({});
Loading.args = {
  show: true,
};

export const Error = Template.bind({});
Error.args = {
  show: true,
  state: 'error',
};
