import { ComponentStory, ComponentMeta } from '@storybook/react';
import { FormTextarea } from './form-textarea';
import ButtonPrimary from '../../button/button';

export default {
  component: FormTextarea,
  title: 'Form Partials/Textarea',
} as ComponentMeta<typeof FormTextarea>;

const Template: ComponentStory<typeof FormTextarea> = (args) => (
  <form onSubmit={(e) => e.preventDefault()}>
    <FormTextarea {...args} onChange={() => {}} />
    <ButtonPrimary onClick={() => {}}>Submit</ButtonPrimary>
  </form>
);

export const Default = Template.bind({});
Default.args = {
  label: 'Name',
};

export const Required = Template.bind({});
Required.args = {
  label: 'Name',
  required: true,
};

export const PrefilledText = Template.bind({});
PrefilledText.args = {
  label: 'Name',
  value: 'John Doe',
};
