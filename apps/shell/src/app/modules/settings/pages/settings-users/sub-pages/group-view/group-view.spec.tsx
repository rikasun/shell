import { IGroupDetails } from '@cased/remotes';
import { render, waitFor } from '@testing-library/react';
import { StoreProvider } from 'easy-peasy';
import { BrowserRouter, Route, Routes } from 'react-router-dom';
import { getMockStore } from '@cased/redux';

import GroupView from './group-view';

describe('GroupView', () => {
  interface IOptions {
    groupMembersResponse?: IGroupDetails;
  }

  const setup = (options: IOptions = {}) => {
    const { groupMembersResponse = { id: '1', name: 'a', members: [] } } =
      options;

    const settingsService = {
      getGroupDetails: () => Promise.resolve(groupMembersResponse),
    };

    window.history.pushState({}, '', `/settings/groups/1`);
    return render(
      <StoreProvider
        store={getMockStore({
          settingsService,
        })}
      >
        <Routes>
          <Route path="/settings/groups/:id" element={<GroupView />} />
        </Routes>
      </StoreProvider>,
      { wrapper: BrowserRouter },
    );
  };

  it('should render successfully', async () => {
    const { getByTestId } = setup();
    await waitFor(() => getByTestId('group-view'));

    expect(getByTestId('group-view')).toBeTruthy();
  });

  it('should print a list of users from an API call', async () => {
    const groupMembersResponse = {
      id: '1',
      name: 'Group 1',
      members: [
        {
          id: '1',
          email: 'asdf@asdf.com',
          role: 'Admin',
        },
      ],
    };

    const { getByTestId, getAllByRole } = setup({ groupMembersResponse });
    await waitFor(() => getByTestId('group-view'));

    expect(
      getAllByRole('cell').find((c) => c.textContent === 'asdf@asdf.com'),
    ).toBeTruthy();
  });
});
