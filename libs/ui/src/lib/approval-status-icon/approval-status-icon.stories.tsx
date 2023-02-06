import { ApprovalStatus } from '@cased/data';
import { ComponentStory, ComponentMeta } from '@storybook/react';
import { ApprovalStatusIcon } from './approval-status-icon';

export default {
  component: ApprovalStatusIcon,
  title: 'ApprovalStatusIcon',
  argTypes: {
    status: {
      options: Object.values(ApprovalStatus),
      control: { type: 'radio' },
      defaultValue: ApprovalStatus.Approved,
    },
  },
} as ComponentMeta<typeof ApprovalStatusIcon>;

const Template: ComponentStory<typeof ApprovalStatusIcon> = (args) => (
  <ApprovalStatusIcon {...args} />
);

export const Approved = Template.bind({});
Approved.args = {
  status: ApprovalStatus.Approved,
  selfApproved: false,
};

export const SelfApproved = Template.bind({});
SelfApproved.args = {
  status: ApprovalStatus.Approved,
  selfApproved: true,
};

export const Open = Template.bind({});
Open.args = {
  status: ApprovalStatus.Open,
  selfApproved: false,
};

export const Denied = Template.bind({});
Denied.args = {
  status: ApprovalStatus.Denied,
  selfApproved: false,
};
