import { ComponentStory, ComponentMeta } from '@storybook/react';
import { BrowserRouter } from 'react-router-dom';
import { Sidebar } from './sidebar';
import { sampleNav } from './sample-nav';

export default {
  component: Sidebar,
  title: 'Sidebar',
} as ComponentMeta<typeof Sidebar>;

const Template: ComponentStory<typeof Sidebar> = (args) => (
  <BrowserRouter>
    <Sidebar {...args} />
  </BrowserRouter>
);

export const Default = Template.bind({});
Default.args = {
  activeId: '1',
  links: sampleNav,
};
