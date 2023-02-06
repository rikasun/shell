import { ComponentStory, ComponentMeta } from '@storybook/react';
import { TextDuration } from './text-duration';

export default {
  component: TextDuration,
  title: 'Text / Duration',
} as ComponentMeta<typeof TextDuration>;

const Template: ComponentStory<typeof TextDuration> = (args) => (
  <TextDuration {...args} />
);

const twoHoursAgo = new Date();
twoHoursAgo.setHours(twoHoursAgo.getHours() - 2);
twoHoursAgo.setMinutes(twoHoursAgo.getMinutes() - 30);

export const Hours = Template.bind({});
Hours.args = {
  begin: twoHoursAgo,
  end: new Date(),
};

const twentyMinutesAgo = new Date();
twentyMinutesAgo.setMinutes(twentyMinutesAgo.getMinutes() - 20);

export const Minutes = Template.bind({});
Minutes.args = {
  begin: twentyMinutesAgo,
  end: new Date(),
};

const twentySecondsAgo = new Date();
twentySecondsAgo.setSeconds(twentySecondsAgo.getSeconds() - 20);

export const Seconds = Template.bind({});
Seconds.args = {
  begin: twentySecondsAgo,
  end: new Date(),
};

export const ZeroSeconds = Template.bind({});
ZeroSeconds.args = {
  begin: new Date(),
  end: new Date(),
};
