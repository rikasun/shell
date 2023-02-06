import { ComponentStory, ComponentMeta } from '@storybook/react';
import { FormInputText } from './form-input-text';
import Button from '../../button/button';

export default {
  component: FormInputText,
  title: 'Form Partials/Input Text',
} as ComponentMeta<typeof FormInputText>;

const Template: ComponentStory<typeof FormInputText> = (args) => (
  <form className="space-y-4" onSubmit={(e) => e.preventDefault()}>
    <FormInputText {...args} onChange={() => {}} />
    <Button display="primary" onClick={() => {}}>
      Submit
    </Button>
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
