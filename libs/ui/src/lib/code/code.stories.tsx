import { ComponentStory, ComponentMeta } from '@storybook/react';
import { Code } from './code';

export default {
  component: Code,
  title: 'Code',
} as ComponentMeta<typeof Code>;

const Template: ComponentStory<typeof Code> = (args) => <Code {...args} />;

export const SingleLine = Template.bind({});
SingleLine.args = {
  children: `Single line code block`,
};

export const MultiLine = Template.bind({});
MultiLine.args = {
  children: `1st line of code
2nd line of code
3rd line of code
`,
};

export const Overflow = Template.bind({});
Overflow.args = {
  children: `echo "ecdsa-sha2-nistp256 AAAAE2VjZHNhLXNoYTItbmlzdHAyNTYAAAAIbmlzdHAyNTYAAABBBF2UgFbCFgYNF9gtPoV9AGtBp7gEnMJQSO/r2I7PluMxtY8H0xdlp0tetV/dO7WcsmmU2U7i+KbQ3GSN00BzpYw=| sudo tee /etc/ssh/cased_1E7yZDU9Awif80KBuytqS9DwiqH.pub
echo "TrustedUserCAKeys /etc/ssh/cased_1E7yZDU9Awif80KBuytqS9DwiqH.pub" | sudo tee -a /etc/ssh/sshd_config
echo "noreply+cased2022_1@ashblue-congenial-fortnight-gj55pggrxf6r7-8888.githubpreview.dev" | sudo tee /etc/ssh/cased_org_principal
echo "AuthorizedPrincipalsFile /etc/ssh/cased_org_principal" | sudo tee -a /etc/ssh/sshd_config
sudo systemctl restart sshd`,
};
