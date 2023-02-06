import { ComponentStory, ComponentMeta } from '@storybook/react';
import { FormRadio } from './form-radio';
import ButtonPrimary from '../../button/button';

export default {
  component: FormRadio,
  title: 'Form Partials/Radio',
} as ComponentMeta<typeof FormRadio>;

const Template: ComponentStory<typeof FormRadio> = (args) => (
  <form onSubmit={(e) => e.preventDefault()}>
    <FormRadio {...args} onChange={() => {}} />
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

export const WithDescriptions = Template.bind({});
WithDescriptions.args = {
  label: 'City',
  value: 'san-francisco',
  options: [
    {
      value: 'san-francisco',
      label: 'San Francisco',
      description: 'Copilot says: Best for startups',
    },
    {
      value: 'seattle',
      label: 'Seattle',
      description: 'Copilot says: Best for tech giants',
    },
  ],
};
