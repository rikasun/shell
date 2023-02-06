import { ComponentStory, ComponentMeta } from '@storybook/react';
import ButtonPrimary from '../../button/button';
import { FormKeyValueCreator } from './form-key-value-creator';

export default {
  component: FormKeyValueCreator,
  title: 'Form Partials/Key Value Creator',
} as ComponentMeta<typeof FormKeyValueCreator>;

const Template: ComponentStory<typeof FormKeyValueCreator> = (args) => (
  <form onSubmit={(e) => e.preventDefault()}>
    {/* eslint-disable-next-line no-console */}
    <FormKeyValueCreator {...args} onChange={console.log} />
    <ButtonPrimary onClick={() => {}}>Submit</ButtonPrimary>
  </form>
);

export const Default = Template.bind({});
Default.args = {
  name: 'name value',
  values: [],
  headerKey: 'Key',
  headerValue: 'Value',
};

export const PrefilledText = Template.bind({});
PrefilledText.args = {
  name: 'name value',
  values: [
    { id: '1', label: 'key1', value: 'value1' },
    { id: '2', label: 'key2', value: 'value2' },
    { id: '3', label: 'key3', value: 'value3' },
  ],
  headerKey: 'Key',
  headerValue: 'Value',
};
