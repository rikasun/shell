import { ComponentStory, ComponentMeta } from '@storybook/react';
import { FormInputCheckbox } from './form-input-checkbox';

export default {
  component: FormInputCheckbox,
  title: 'Form Partials / Checkbox',
  argTypes: {
    onChange: { action: 'onChange' },
  },
} as ComponentMeta<typeof FormInputCheckbox>;

const Template: ComponentStory<typeof FormInputCheckbox> = (args) => (
  <form onSubmit={(e) => e.preventDefault()}>
    <FormInputCheckbox {...args} />
  </form>
);

export const Default = Template.bind({});
Default.args = {
  label: 'Checkbox',
  name: 'my-checkbox-id',
  description: 'This is a checkbox',
};

export const PreChecked = Template.bind({});
PreChecked.args = {
  label: 'Checkbox',
  name: 'my-checkbox-id',
  description: 'This is a checkbox',
  value: true,
};
