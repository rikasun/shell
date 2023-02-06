import { ComponentStory, ComponentMeta } from '@storybook/react';
import { FormSelect } from './form-select';
import ButtonPrimary from '../../button/button';

export default {
  component: FormSelect,
  title: 'Form Partials/Select',
} as ComponentMeta<typeof FormSelect>;

const Template: ComponentStory<typeof FormSelect> = (args) => (
  <form onSubmit={(e) => e.preventDefault()}>
    <FormSelect {...args} onChange={() => {}} />
    <ButtonPrimary onClick={() => {}}>Submit</ButtonPrimary>
  </form>
);

const options = [
  { value: 'san-francisco', label: 'San Francisco' },
  { value: 'seattle', label: 'Seattle' },
];

export const Default = Template.bind({});
Default.args = {
  label: 'City',
  defaultOption: 'Select a city',
  value: '',
  options,
};

export const Required = Template.bind({});
Required.args = {
  label: 'City',
  required: true,
  options,
};

export const PreFilledValue = Template.bind({});
PreFilledValue.args = {
  label: 'City',
  value: 'san-francisco',
  options,
};
