import { ComponentStory, ComponentMeta } from '@storybook/react';
import TextBlock from './text-block';

export default {
  component: TextBlock,
  title: 'Text / Block',
} as ComponentMeta<typeof TextBlock>;

const Template: ComponentStory<typeof TextBlock> = (args) => (
  <TextBlock {...args} />
);

export const SingleLine = Template.bind({});
SingleLine.args = {
  children: 'This is a single line of text',
};

export const MultiLine = Template.bind({});
MultiLine.args = {
  children:
    'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed tincidunt, nisl eget aliquam tincidunt, nisl nisl aliquet nisl, et aliquam nisl nisl sit amet nisl. Donec euismod, nisl eget consectetur lacinia, nisl nisl aliquet nisl, et aliquam nisl nisl sit amet nisl. Donec euismod, nisl eget consectetur lacinia, nisl nisl aliquet nisl, et aliquam nisl nisl sit amet nisl. Donec euismod, nisl eget consectetur lacinia, nisl nisl aliquet nisl, et aliquam nisl.',
};
