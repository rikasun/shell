import { ComponentMeta, ComponentStory } from '@storybook/react';
import { FormPartialHiddenPassword } from './form-partial-hidden-password';

export default {
  component: FormPartialHiddenPassword,
  title: 'Form Partials/Input Hidden Password',
  argTypes: {
    onChange: { action: 'onChange' },
    onEdit: { action: 'onEdit' },
  },
} as ComponentMeta<typeof FormPartialHiddenPassword>;

const Template: ComponentStory<typeof FormPartialHiddenPassword> = (args) => (
  <form onSubmit={(e) => e.preventDefault()}>
    <FormPartialHiddenPassword {...args} />
  </form>
);

export const Default = Template.bind({});
Default.args = {
  name: 'password',
  label: 'Hidden Password',
  defaultValue: '********',
};
