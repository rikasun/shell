import { Button, FormInputText, TextBlock, TextLink } from '@cased/ui';
import { useStoreActions } from '@cased/redux';
import { useCallback, useState } from 'react';
import SettingsTemplate, { TabId } from '../../settings-template';

export function PageSettingsAddUser() {
  const [form, setForm] = useState({
    email: '',
    password: '',
  });

  const create = useStoreActions((actions) => actions.users.create);

  const updateForm = useCallback((name: string, value: string) => {
    setForm((prev) => ({ ...prev, [name]: value }));
  }, []);

  const onSubmit = useCallback(
    async (e: React.FormEvent<HTMLFormElement>) => {
      e.preventDefault();
      const success = await create(form);
      if (success) setForm({ email: '', password: '' });
    },
    [form, create],
  );

  return (
    <SettingsTemplate testId="page-settings-add-user" activeTab={TabId.AddUser}>
      <TextBlock>
        This page is for testing the open source project. Email{' '}
        <TextLink href="mailto:team@cased.com">team@cased.com</TextLink> for
        more advanced user management tools.
      </TextBlock>

      <form onSubmit={onSubmit} className="space-y-4">
        <FormInputText
          required
          name="email"
          label="Email"
          value={form.email}
          onChange={updateForm}
          type="email"
        />

        <FormInputText
          required
          name="password"
          label="Password"
          value={form.password}
          onChange={updateForm}
          type="password"
        />

        <Button type="submit">Create User</Button>
      </form>

      <TextBlock>
        To manage users visit the{' '}
        <TextLink to="/settings/users">Users and Groups</TextLink> page.
      </TextBlock>
    </SettingsTemplate>
  );
}

export default PageSettingsAddUser;
