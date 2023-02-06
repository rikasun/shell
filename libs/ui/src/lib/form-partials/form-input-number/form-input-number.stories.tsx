import { ComponentStory, ComponentMeta } from '@storybook/react';
import { FormInputNumber } from './form-input-number';

export default {
  component: FormInputNumber,
  title: 'Form Partials/Input Number',
  argTypes: {
    onChange: { action: 'onChange' },
  },
} as ComponentMeta<typeof FormInputNumber>;

const Template: ComponentStory<typeof FormInputNumber> = (args) => (
  <form className="space-y-4" onSubmit={(e) => e.preventDefault()}>
    <FormInputNumber {...args} />
  </form>
);

export const Default = Template.bind({});
Default.args = {
  label: 'Your Number',
  name: 'my-input-id',
  placeholder: 'Put a number here',
};
