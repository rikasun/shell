import { ComponentStory, ComponentMeta } from '@storybook/react';
import { nanoid } from 'nanoid';
import { FieldType } from '@cased/data';
import { FormFields } from './form-fields';
import Button from '../../button/button';

export default {
  component: FormFields,
  title: 'Form Partials/Form Fields',
  argTypes: {
    onChange: { action: 'onChange' },
    onDelete: { action: 'onDelete' },
  },
} as ComponentMeta<typeof FormFields>;

const Template: ComponentStory<typeof FormFields> = (args) => (
  <form onSubmit={(e) => e.preventDefault()}>
    <FormFields {...args} />
    <Button display="primary" onClick={() => {}}>
      Submit
    </Button>
  </form>
);

export const Text = Template.bind({});
Text.args = {
  name: 'Text Input',
  id: nanoid(),
  type: FieldType.Text,
};

export const Dropdown = Template.bind({});
Dropdown.args = {
  name: 'Dropdown Input',
  id: nanoid(),
  type: FieldType.Dropdown,
};

export const Radio = Template.bind({});
Radio.args = {
  name: 'Radio Input',
  id: nanoid(),
  type: FieldType.Radio,
};
