import { ComponentStory, ComponentMeta } from '@storybook/react';
import { Button } from './button';

export default {
  component: Button,
  title: 'Button',
  argTypes: {
    display: {
      options: ['default', 'primary', 'link', 'danger'],
      control: { type: 'radio' },
    },
    size: {
      options: ['small', 'default'],
      control: { type: 'radio' },
    },
  },
} as ComponentMeta<typeof Button>;

const Template: ComponentStory<typeof Button> = (args) => (
  <Button {...args}>Example Button</Button>
);

export const Default = Template.bind({});
Default.args = {
  display: 'default',
};
