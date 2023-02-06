import { ILog } from '@cased/remotes';
import { render, waitFor } from '@testing-library/react';
import { StoreProvider } from 'easy-peasy';
import { BrowserRouter, Route, Routes } from 'react-router-dom';
import { getMockStore } from '@cased/redux';

import GroupLogs from './group-logs';

describe('GroupLogs', () => {
  interface IOptions {
    groupLogsResponse?: ILog[];
  }

  const setup = (options: IOptions = {}) => {
    const { groupLogsResponse = [] } = options;

    const settingsService = {
      getGroupLogs: () => Promise.resolve(groupLogsResponse),
    };

    window.history.pushState({}, '', `/settings/groups/activity/1`);
    return render(
      <StoreProvider
        store={getMockStore({
          settingsService,
        })}
      >
        <Routes>
          <Route path="/settings/groups/activity/:id" element={<GroupLogs />} />
        </Routes>
      </StoreProvider>,
      { wrapper: BrowserRouter },
    );
  };

  it('should render successfully', async () => {
    const { findByTestId } = setup();
    await waitFor(() => findByTestId('group-logs'));

    expect(findByTestId('group-logs'));
  });

  it('should print out logs', async () => {
    const email = 'asdf@asdf.com';
    const groupLogsResponse: ILog[] = [
      {
        id: '1',
        email: 'asdf@asdf.com',
        location: 'Federal Way, Washington',
        host: 'Unknown',
        ip: '73.181.219.55',
      },
    ];

    const { findByTestId, findByText } = setup({ groupLogsResponse });
    await waitFor(() => findByTestId('group-logs'));

    expect(findByText(email)).toBeTruthy();
  });
});
