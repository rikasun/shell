import { ApprovalStatus } from '@cased/data';
import { ComponentStory, ComponentMeta } from '@storybook/react';
import { BrowserRouter } from 'react-router-dom';
import { Approval } from './approval';

export default {
  component: Approval,
  title: 'Approval',
  argTypes: {
    status: {
      options: Object.values(ApprovalStatus),
      control: { type: 'radio' },
      defaultValue: ApprovalStatus.Approved,
    },
  },
} as ComponentMeta<typeof Approval>;

const Template: ComponentStory<typeof Approval> = (args) => (
  <BrowserRouter>
    <Approval {...args} />
  </BrowserRouter>
);

export const Approved = Template.bind({});
Approved.args = {
  avatarUrl: 'https://placebeard.it/250/250',
  id: '1',
  requestorEmail: 'søren@kierkegaard.dk',
  prompt:
    "{'environment': 'development', 'script': 'local-run-docker', 'app': 'bastion'}",
  status: ApprovalStatus.Approved,
  border: true,
};

export const Open = Template.bind({});
Open.args = {
  avatarUrl: 'https://placebeard.it/250/250',
  id: '1',
  requestorEmail: 'søren@kierkegaard.dk',
  command:
    "{'environment': 'development', 'script': 'local-run-docker', 'app': 'bastion'}",
  status: ApprovalStatus.Open,
  border: true,
};

export const Denied = Template.bind({});
Denied.args = {
  avatarUrl: 'https://placebeard.it/250/250',
  id: '1',
  requestorEmail: 'søren@kierkegaard.dk',
  prompt:
    "{'environment': 'development', 'script': 'local-run-docker', 'app': 'bastion'}",
  status: ApprovalStatus.Denied,
  border: true,
};
