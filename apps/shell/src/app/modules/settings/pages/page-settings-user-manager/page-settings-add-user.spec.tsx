import { getMockStore } from '@cased/redux';
import { usersService as UsersServiceType } from '@cased/remotes';
import {
  act,
  fireEvent,
  render,
  RenderResult,
  waitFor,
} from '@testing-library/react';
import { StoreProvider } from 'easy-peasy';
import { BrowserRouter } from 'react-router-dom';
import NotificationList from '../../../notification-list/notification-list';

import PageSettingsAddUser from './page-settings-add-user';

describe('PageSettingsAddUser', () => {
  const email = 'asdf@asdf.com';
  const password = 'my password';

  interface IOptions {
    usersService?: Partial<typeof UsersServiceType>;
  }

  const setup = (options: IOptions = {}) => {
    const { usersService = {} } = options;

    return render(
      <StoreProvider store={getMockStore({ usersService })}>
        <NotificationList />
        <PageSettingsAddUser />
      </StoreProvider>,
      { wrapper: BrowserRouter },
    );
  };

  it('should render successfully', async () => {
    const { getByTestId } = setup();

    const page = getByTestId('page-settings-add-user');

    await waitFor(() => expect(page).toBeTruthy());
  });

  describe('form', () => {
    describe('success', () => {
      const fillOutForm = async (result: RenderResult) => {
        const { getByLabelText, getByText } = result;

        const emailInput = getByLabelText('Email');
        fireEvent.change(emailInput, { target: { value: email } });

        const passwordInput = getByLabelText('Password');
        fireEvent.change(passwordInput, { target: { value: password } });

        const submitButton = getByText('Create User');
        act(() => {
          fireEvent.click(submitButton);
        });

        await waitFor(() => result.getByText('User created successfully'));
      };

      it('should submit to the usersService', async () => {
        const usersService = {
          create: jest.fn().mockResolvedValue({}),
        };

        const result = setup({ usersService });
        await fillOutForm(result);

        await waitFor(() =>
          expect(usersService.create).toHaveBeenCalledWith(email, password),
        );
      });

      it('should show a success message when submitting successfully', async () => {
        const usersService = {
          create: jest.fn().mockResolvedValue({}),
        };

        const result = setup({ usersService });
        await fillOutForm(result);

        await waitFor(() =>
          expect(result.getByText('User created successfully')).toBeTruthy(),
        );
      });

      it('should clear the form', async () => {
        const inputLabels = ['Email', 'Password'];
        const usersService = {
          create: jest.fn().mockResolvedValue({}),
        };

        const result = setup({ usersService });
        await fillOutForm(result);

        await waitFor(() => {
          inputLabels.forEach((label) => {
            const input = result.getByLabelText(label) as HTMLInputElement;
            expect(input.value).toEqual('');
          });
        });
      });
    });

    describe('failure', () => {
      const fillOutForm = (
        result: RenderResult,
        emailValue: string = email,
        passwordValue: string = password,
      ) => {
        const { getByLabelText, getByText } = result;

        const emailInput = getByLabelText('Email');
        fireEvent.change(emailInput, { target: { value: emailValue } });

        const passwordInput = getByLabelText('Password');
        fireEvent.change(passwordInput, { target: { value: passwordValue } });

        const submitButton = getByText('Create User');
        act(() => {
          fireEvent.click(submitButton);
        });
      };

      it('should show an error message when submitting unsuccessfully', async () => {
        const usersService = {
          create: jest.fn().mockRejectedValue({}),
        };

        const result = setup({ usersService });
        fillOutForm(result);

        await waitFor(() =>
          expect(
            result.getByText('Failed to create user. Please try again'),
          ).toBeTruthy(),
        );
      });

      it('should not submit when the form has no email', () => {
        const usersService = {
          create: jest.fn(),
        };

        const result = setup({ usersService });
        fillOutForm(result, '');

        expect(usersService.create).not.toHaveBeenCalled();
      });

      it('should not submit when the form has no password', () => {
        const usersService = {
          create: jest.fn(),
        };

        const result = setup({ usersService });
        fillOutForm(result, 'email@asdf.com', '');

        expect(usersService.create).not.toHaveBeenCalled();
      });

      it('should not submit with an invalid email', () => {
        const usersService = {
          create: jest.fn(),
        };

        const result = setup({ usersService });
        fillOutForm(result, 'asdf');

        expect(usersService.create).not.toHaveBeenCalled();
      });

      it('should not clear the form', async () => {
        const inputLabels = ['Email', 'Password'];
        const usersService = {
          create: jest.fn().mockRejectedValue({}),
        };

        const result = setup({ usersService });
        fillOutForm(result);

        await waitFor(() =>
          result.getByText('Failed to create user. Please try again'),
        );

        inputLabels.forEach((label) => {
          const input = result.getByLabelText(label) as HTMLInputElement;
          expect(input.value).toEqual(label === 'Email' ? email : password);
        });
      });
    });
  });
});
