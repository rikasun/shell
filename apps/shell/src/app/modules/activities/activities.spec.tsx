import { ILog } from '@cased/remotes';
import { render, waitFor } from '@testing-library/react';
import { StoreProvider } from 'easy-peasy';
import { BrowserRouter, Route, Routes } from 'react-router-dom';
import { getMockStore } from '@cased/redux';
import ActivityLogs from './activities';

describe('Activity logs', () => {
  interface IOptions {
    activityLogsResponse?: ILog[];
  }

  const setup = (options: IOptions = {}) => {
    const {
      activityLogsResponse = [
        {
          id: '1',
          email: 'example@test.dev',
          location: 'location',
          host: 'host',
          ip: 'ip',
          session: {
            id: 'id',
            startTime: new Date(),
            endTime: new Date(),
          },
        },
      ],
    } = options;

    const activitiesService = {
      getAll: () => Promise.resolve(activityLogsResponse),
    };
    window.history.pushState({}, '', `/activities`);

    return render(
      <StoreProvider
        store={getMockStore({
          activitiesService,
        })}
      >
        <Routes>
          <Route path="/activities" element={<ActivityLogs />} />
        </Routes>
      </StoreProvider>,
      { wrapper: BrowserRouter },
    );
  };
  it('should render successfully', async () => {
    const { findByTestId, findAllByText } = setup();

    await waitFor(() => findByTestId('activity-logs'));

    expect(findByTestId('activity-logs')).toBeTruthy();

    expect(findAllByText('example@test.dev')).toBeTruthy();
  });
});
