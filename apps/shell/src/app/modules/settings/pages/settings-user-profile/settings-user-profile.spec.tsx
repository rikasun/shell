import { IUser } from '@cased/remotes';
import { render, waitFor } from '@testing-library/react';
import { StoreProvider } from 'easy-peasy';
import { BrowserRouter } from 'react-router-dom';
import { getMockStore } from '@cased/redux';

import SettingsUserProfile from './settings-user-profile';

describe('SettingsUserProfile', () => {
  const user: IUser = {
    name: 'John Doe',
    email: 'asdf@gmail.com',
    groups: ['Customer Support'],
  };

  it('should render successfully', async () => {
    const usersService = {
      get: jest.fn().mockReturnValue(Promise.resolve(user)),
    };

    const { getByTestId } = render(
      <StoreProvider store={getMockStore({ usersService })}>
        <SettingsUserProfile />
      </StoreProvider>,
      { wrapper: BrowserRouter },
    );

    await waitFor(() =>
      expect(getByTestId('settings-user-profile')).toBeTruthy(),
    );
  });

  it('should print the returned user details from the user service', async () => {
    const usersService = {
      get: jest.fn().mockReturnValue(Promise.resolve(user)),
    };

    const { getAllByRole, getByTestId } = render(
      <StoreProvider store={getMockStore({ usersService })}>
        <SettingsUserProfile />
      </StoreProvider>,
      { wrapper: BrowserRouter },
    );

    await waitFor(() => getByTestId('settings-user-profile'));

    expect(
      getAllByRole('listitem').find(({ textContent }) =>
        textContent?.includes(user.email || ''),
      ),
    ).toBeTruthy();
  });

  it('should not crash if the user is empty', async () => {
    const usersService = {
      get: jest.fn().mockReturnValue(Promise.resolve({})),
    };

    const { getByTestId } = render(
      <StoreProvider store={getMockStore({ usersService })}>
        <SettingsUserProfile />
      </StoreProvider>,
      { wrapper: BrowserRouter },
    );

    await waitFor(() =>
      expect(getByTestId('settings-user-profile')).toBeTruthy(),
    );
  });
});
