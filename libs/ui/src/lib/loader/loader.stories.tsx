import { ComponentStory, ComponentMeta } from '@storybook/react';
import { Loader } from './loader';

export default {
  component: Loader,
  title: 'Loader',
  argTypes: {
    size: {
      options: ['small', 'medium', 'large'],
      control: { type: 'radio' },
    },
  },
} as ComponentMeta<typeof Loader>;

const Template: ComponentStory<typeof Loader> = (args) => (
  <Loader {...args}>Example Loader</Loader>
);

export const Default = Template.bind({});
Default.args = {
  className: 'text-primary',
};
