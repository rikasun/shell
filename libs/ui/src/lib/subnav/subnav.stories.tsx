import { ComponentStory, ComponentMeta } from '@storybook/react';
import { BrowserRouter } from 'react-router-dom';
import { Subnav } from './subnav';

export default {
  component: Subnav,
  title: 'Sub Navigation',
} as ComponentMeta<typeof Subnav>;

const Template: ComponentStory<typeof Subnav> = (args) => (
  <BrowserRouter>
    <Subnav {...args} />
  </BrowserRouter>
);

export const Default = Template.bind({});
Default.args = {
  activeId: 'general',
  tabs: [
    { text: 'General', to: '/settings', id: 'general' },
    { text: 'Billing', to: '/settings/billing', id: 'billing' },
    { text: 'Security', to: '/settings/security', id: 'security' },
    { text: 'Integrations', to: '/settings/integrations', id: 'integrations' },
  ],
};
