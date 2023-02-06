import { useStoreActions } from '@cased/redux';
import { Button, FormInputText } from '@cased/ui';
import { useCallback, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import PageWrapper from '../../routes/page-wrapper';
import { ReactComponent as CasedLogo } from './cased-logo.svg';

export function Login() {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    email: '',
    password: '',
  });

  const login = useStoreActions((actions) => actions.auth.loginOpenSource);

  const updateForm = useCallback((name: string, value: string) => {
    setForm((prev) => ({ ...prev, [name]: value }));
  }, []);

  const onSubmit = useCallback(
    async (e: React.FormEvent<HTMLFormElement>) => {
      e.preventDefault();
      const success = await login(form);
      if (success) {
        navigate('/dashboard');
      }
    },

    [form, login, navigate],
  );

  return (
    <PageWrapper>
      <div
        data-testid="login"
        className="container mx-auto mt-10 max-w-xs px-5"
      >
        <div className="flex flex-col space-y-4">
          <h1 className="mx-auto flex items-center space-x-2">
            <CasedLogo className="inline-block h-8 w-8" />
            <span className="font-medium text-gray-900">Cased</span>
          </h1>

          <form onSubmit={onSubmit} className="flex flex-col space-y-4">
            <FormInputText
              label="Email"
              name="email"
              type="email"
              required
              onChange={updateForm}
            />

            <FormInputText
              label="Password"
              name="password"
              type="password"
              required
              onChange={updateForm}
            />

            <Button type="submit">Login</Button>
          </form>
        </div>
      </div>
    </PageWrapper>
  );
}

export default Login;
