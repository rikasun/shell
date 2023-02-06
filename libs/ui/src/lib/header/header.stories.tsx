import { ComponentStory, ComponentMeta } from '@storybook/react';
import { BrowserRouter } from 'react-router-dom';
import { Header } from './header';
import { headerLinksExample } from './header-links-example';

import logo from './shell-logo.svg';

export default {
  component: Header,
  title: 'Header',
} as ComponentMeta<typeof Header>;

const Template: ComponentStory<typeof Header> = (args) => (
  <BrowserRouter>
    <Header {...args} />
  </BrowserRouter>
);

export const Default = Template.bind({});
Default.args = {
  title: 'Cased, Inc.',
  userName: 'janedoe@acmecorp.net',
  userLinks: headerLinksExample,
  logo: <img alt="logo" src={logo} width="24" />,
};
