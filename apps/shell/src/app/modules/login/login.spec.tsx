import { getMockStore } from '@cased/redux';
import { A } from '@cased/test-utilities';
import {
  fireEvent,
  render,
  RenderResult,
  waitFor,
} from '@testing-library/react';
import { BrowserRouter, Route, Routes } from 'react-router-dom';
import sign from 'jwt-encode';
import { act } from 'react-dom/test-utils';
import { authService as AuthService } from '@cased/remotes';
import { StoreProvider } from 'easy-peasy';
import Login from './login';
import PageTwoColumn from '../shared/page-two-column/page-two-column';
import NotificationList from '../notification-list/notification-list';

describe('Login', () => {
  interface IOptions {
    authService?: Partial<typeof AuthService>;
  }

  const setup = (options: IOptions = {}) => {
    const { authService = {} } = options;

    window.history.pushState({}, '', `/login`);

    return render(
      <StoreProvider
        store={getMockStore({
          authService,
        })}
      >
        <Routes>
          <Route
            path="/login"
            element={
              <>
                <NotificationList />
                <Login />
              </>
            }
          />
          <Route
            path="/dashboard"
            element={<PageTwoColumn>dashboard</PageTwoColumn>}
          />
        </Routes>
      </StoreProvider>,
      { wrapper: BrowserRouter },
    );
  };

  it('should render successfully', () => {
    const { getByTestId } = setup();

    const login = getByTestId('login');

    expect(login).toBeTruthy();
  });

  describe('form', () => {
    const email = 'asdf@asdf.com';
    const password = 'asdfasdf';

    const fillOutForm = async (
      { getByLabelText, getByText }: RenderResult,
      emailValue: string,
      passwordValue: string,
    ) => {
      const emailInput = getByLabelText('Email');
      fireEvent.change(emailInput, { target: { value: emailValue } });

      const passwordInput = getByLabelText('Password');
      fireEvent.change(passwordInput, { target: { value: passwordValue } });

      const submitButton = getByText('Login');

      await act(() => {
        fireEvent.click(submitButton);
      });
    };

    it('should display the user email on the dashboard path after logging in', async () => {
      const user = A.user().withEmail(email).build();

      const authService = {
        loginOpenSource: jest.fn().mockResolvedValue({
          accessToken: sign(user, ''),
        }),
      };

      const renderResult = setup({ authService });
      const { getByText } = renderResult;
      await fillOutForm(renderResult, email, password);

      await waitFor(() => expect(getByText(email)).toBeTruthy());
    });

    it('should display an error message if the login fails', async () => {
      const authService = {
        loginOpenSource: jest.fn().mockRejectedValue({}),
      };

      const renderResult = setup({ authService });
      const { getByText } = renderResult;
      await fillOutForm(renderResult, email, password);

      await waitFor(() =>
        expect(getByText('Login failed. Please try again')).toBeTruthy(),
      );
    });

    it('should not redirect to the dashboard if the login fails', async () => {
      const authService = {
        loginOpenSource: jest.fn().mockRejectedValue({}),
      };

      const renderResult = setup({ authService });
      const { queryByText } = renderResult;
      await fillOutForm(renderResult, email, password);

      await waitFor(() => expect(queryByText('dashboard')).toBeFalsy());
    });

    it('should not submit if the email is invalid', async () => {
      const authService = {
        loginOpenSource: jest.fn().mockResolvedValue({}),
      };

      const renderResult = setup({ authService });
      const { queryByText } = renderResult;
      await fillOutForm(renderResult, '', password);

      await waitFor(() => expect(queryByText('dashboard')).toBeFalsy());
    });

    it('should not submit if the password is invalid', async () => {
      const authService = {
        loginOpenSource: jest.fn().mockResolvedValue({}),
      };

      const renderResult = setup({ authService });
      const { queryByText } = renderResult;
      await fillOutForm(renderResult, email, '');

      await waitFor(() => expect(queryByText('dashboard')).toBeFalsy());
    });
  });
});
