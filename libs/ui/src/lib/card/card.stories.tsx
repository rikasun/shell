import { ComponentStory, ComponentMeta } from '@storybook/react';
import { Card, CardBlock, CardTitle } from './card';
import { TextBlock } from '../text/text-block/text-block';

export default {
  component: Card,
  title: 'Card',
} as ComponentMeta<typeof Card>;

const Template: ComponentStory<typeof Card> = (args) => <Card {...args} />;

export const Default = Template.bind({});
Default.args = {
  children: (
    <>
      <CardBlock>
        <CardTitle subtitle="Subtitle">Title</CardTitle>
      </CardBlock>

      <CardBlock>
        <TextBlock>More content goes here</TextBlock>
      </CardBlock>
    </>
  ),
};

export const MultiBlockStack = Template.bind({});
MultiBlockStack.args = {
  children: (
    <>
      <CardBlock>
        <CardTitle subtitle="Subtitle">Title</CardTitle>
      </CardBlock>

      <CardBlock>
        <TextBlock>Content goes here</TextBlock>
      </CardBlock>

      <CardBlock>
        <TextBlock>More content goes here</TextBlock>
      </CardBlock>
    </>
  ),
};

export const TextOnly = Template.bind({});
TextOnly.args = {
  children: (
    <CardBlock>
      <TextBlock>Content goes here</TextBlock>
    </CardBlock>
  ),
};

export const TitleWithText = Template.bind({});
TitleWithText.args = {
  children: (
    <CardBlock>
      <CardTitle className="mb-4">Title</CardTitle>
      <TextBlock>Content goes here</TextBlock>
    </CardBlock>
  ),
};
