import { ComponentStory, ComponentMeta } from '@storybook/react';
import { BrowserRouter } from 'react-router-dom';
import { TextLink } from './text-link';

export default {
  component: TextLink,
  title: 'Text / Link',
} as ComponentMeta<typeof TextLink>;

const Template: ComponentStory<typeof TextLink> = (args) => (
  <BrowserRouter>
    <TextLink {...args}>Link Text</TextLink>
  </BrowserRouter>
);

export const WithAHref = Template.bind({});
WithAHref.args = {
  href: 'https://www.google.com',
};

export const WithLinkTag = Template.bind({});
WithLinkTag.args = {
  to: '/home',
};

export const WithTargetBlank = Template.bind({});
WithTargetBlank.args = {
  href: 'https://www.google.com',
  targetBlank: true,
};

export const WithOnClick = Template.bind({});
WithOnClick.args = {
  // eslint-disable-next-line no-alert
  onClick: () => alert('Clicked!'),
};

export const WithDisplayDanger = Template.bind({});
WithDisplayDanger.args = {
  href: 'https://www.google.com',
  display: 'danger',
};
