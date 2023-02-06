import { ComponentStory, ComponentMeta } from '@storybook/react';
import { BlockType } from '@cased/data';
import { Node } from './node';

export default {
  component: Node,
  title: 'Node',
  argTypes: {
    blockType: {
      options: [
        BlockType.Rest,
        BlockType.Database,
        BlockType.Shell,
        BlockType.Form,
        BlockType.Text,
      ],
      control: { type: 'select' },
    },
  },
} as ComponentMeta<typeof Node>;

const Template: ComponentStory<typeof Node> = (args) => (
  <Node {...args}>Node</Node>
);

export const Default = Template.bind({});
Default.args = {
  title: 'Node title',
  blockType: BlockType.Rest,
  children: <div>Hello!</div>,
};

export const Active = Template.bind({});
Active.args = {
  title: 'Node title',
  blockType: BlockType.Rest,
  active: true,
};
