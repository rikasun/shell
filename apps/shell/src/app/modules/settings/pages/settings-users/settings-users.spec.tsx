import {
  ISettingsPromptAccess,
  ISettingsGroup,
  ISettingsUser,
} from '@cased/remotes';
import {
  fireEvent,
  render,
  waitFor,
  waitForElementToBeRemoved,
} from '@testing-library/react';
import { StoreProvider } from 'easy-peasy';
import { act } from 'react-dom/test-utils';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { getMockStore } from '@cased/redux';
import Loading from '../../../loading/loading';

import SettingsUsers from './settings-users';

describe('SettingsUsers', () => {
  interface IOptions {
    groups?: ISettingsGroup[];
    users?: ISettingsUser[];
    setUserRole?: () => Promise<ISettingsUser>;
    initialUrl?: string;
    getPromptAccess?: ISettingsPromptAccess;
    setPromptAccess?: () => Promise<void>;
  }

  const setup = (options: IOptions = {}) => {
    const {
      groups,
      users,
      setUserRole,
      initialUrl,
      getPromptAccess,
      setPromptAccess,
    } = {
      getPromptAccess: { user: '', group: '' },
      groups: [],
      users: [],
      initialUrl: '/settings/users',
      ...options,
    };

    const settingsService = {
      setPromptAccess,
      getGroupsAndUsers: () =>
        Promise.resolve({
          groups,
          users,
        }),
      setUserRole,
      getPromptAccess: () => Promise.resolve(getPromptAccess),
    };

    return render(
      <MemoryRouter initialEntries={[initialUrl]}>
        <StoreProvider store={getMockStore({ settingsService })}>
          <Routes>
            <Route
              path="/settings/users"
              element={
                <div>
                  <Loading />
                  <SettingsUsers />
                </div>
              }
            />
          </Routes>
        </StoreProvider>
      </MemoryRouter>,
    );
  };

  it('should render successfully', async () => {
    const { getByTestId } = setup();

    await waitFor(() => expect(getByTestId('settings-users')).toBeTruthy());
  });

  it('should print out the populated groups from the redux store', async () => {
    const groups = [
      {
        id: '1',
        name: 'Test Group',
        users: 2,
      },
    ];

    const { getByText } = setup({ groups });

    await waitFor(() => expect(getByText('Test Group')).toBeTruthy());
  });

  describe('Access IDE blocks', () => {
    it('should print the user access code block', async () => {
      const getPromptAccess = { user: '{}', group: '' };

      const { getByDisplayValue } = setup({ getPromptAccess });

      await waitFor(() => expect(getByDisplayValue('{}')).toBeTruthy());
    });

    it('should print the group access code block', async () => {
      const getPromptAccess = { user: '', group: '{}' };

      const { getByDisplayValue } = setup({ getPromptAccess });

      await waitFor(() => expect(getByDisplayValue('{}')).toBeTruthy());
    });

    describe('input interactions', () => {
      const simulateTyping = async (
        targeId: string,
        delay: number,
        value: object,
      ) => {
        jest.useFakeTimers();
        const setPromptAccess = jest.fn().mockReturnValue(Promise.resolve());

        const { getByTestId } = setup({
          setPromptAccess,
        });

        await waitFor(() => expect(getByTestId('settings-users')).toBeTruthy());

        const ide = getByTestId(targeId).querySelector('textarea');
        if (!ide) throw new Error('Could not find the IDE');

        act(() => {
          fireEvent.change(ide, {
            target: { value: JSON.stringify(value) },
          });

          jest.advanceTimersByTime(delay);
        });

        if (delay > 0) {
          await waitForElementToBeRemoved(
            () => !getByTestId('loading').classList.contains('hidden'),
          );
        }

        return setPromptAccess;
      };

      it('should call update on the prompt access when typing into it', async () => {
        const value = {};
        const setPromptAccess = await simulateTyping(
          'settings-users__user-access',
          2000,
          value,
        );

        expect(setPromptAccess).toHaveBeenCalledWith(value, 'user');
      });

      it('should not call update on the prompt access without a delay', async () => {
        const value = {};
        const setPromptAccess = await simulateTyping(
          'settings-users__user-access',
          0,
          value,
        );

        expect(setPromptAccess).not.toHaveBeenCalled();
      });

      it('should update the group prompt access after a delay', async () => {
        const value = {};
        const setPromptAccess = await simulateTyping(
          'settings-users__group-access',
          2000,
          value,
        );

        expect(setPromptAccess).toHaveBeenCalledWith(value, 'group');
      });
    });
  });

  describe('users table', () => {
    it('should print out the populated users from the redux store', async () => {
      const users = [
        {
          id: '1',
          name: 'Test User',
          created: new Date(),
          role: 'Admin',
        },
      ];

      const { getByText } = setup({ users });

      await waitFor(() => expect(getByText('Test User')).toBeTruthy());
    });

    it('should change a user to an admin by clicking "Change Permissions", selecting "Admin", and clicking "Update"', async () => {
      const users = [
        {
          id: '1',
          name: 'Test User',
          created: new Date(),
          role: 'User',
        },
      ];

      const setUserRole = () =>
        Promise.resolve({
          id: '1',
          name: 'Test User',
          created: new Date(),
          role: 'Admin',
        });

      const { getByText, getByLabelText, getByTestId } = setup({
        users,
        setUserRole,
        initialUrl: '/settings/users?permissions=1',
      });

      await waitFor(() => getByText(`Edit role for ${users[0].name}`));

      fireEvent.click(getByLabelText('Admin'));
      fireEvent.click(getByText('Update'));

      await waitFor(() =>
        expect(getByTestId('table-users__role').textContent).toContain('Admin'),
      );
    });
  });
});
