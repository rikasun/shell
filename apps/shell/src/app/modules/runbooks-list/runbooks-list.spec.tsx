import { IRunbookGetAllResponse } from '@cased/remotes';
import { render, waitFor } from '@testing-library/react';
import { StoreProvider } from 'easy-peasy';
import { act } from 'react-dom/test-utils';
import { BrowserRouter } from 'react-router-dom';
import { mockReactFlow } from '@cased/test-utilities';
import { getMockStore } from '@cased/redux';

import RunbooksList from './runbooks-list';

describe('Runbooks list', () => {
  interface IOptions {
    initialRunbooks?: [];
  }

  const setup = async (options: IOptions = {}) => {
    const { initialRunbooks } = options;
    const populateAllResponse: IRunbookGetAllResponse = {
      runbooks: initialRunbooks || [
        {
          id: 1,
          name: 'Runbook 1',
          description: 'Runbook 1 description',
          last_run: '2020-01-01T00:00:00.000Z',
        },
        {
          id: 2,
          name: 'Runbook 2',
          description: 'Runbook 2 description',
          last_run: null,
        },
      ],
    };
    window.history.pushState({}, 'Init', '/runbooks');
    mockReactFlow();

    const result = render(
      <StoreProvider store={getMockStore({ populateAllResponse })}>
        <RunbooksList />
      </StoreProvider>,
      { wrapper: BrowserRouter },
    );

    await waitFor(() => {
      if (populateAllResponse.runbooks.length > 0) {
        return result.getByText(populateAllResponse.runbooks[0].name);
      }

      return result.getByText('Runbooks automate multi-step workflows');
    });

    return result;
  };

  it('should render successfully', async () => {
    const { getByTestId } = await setup();
    expect(getByTestId('runbooks-list')).toBeTruthy();
  });

  describe('initial population', () => {
    it('should render runbook instruction when no runbooks found', async () => {
      const { getByText } = await setup({ initialRunbooks: [] });
      expect(getByText('Runbooks automate multi-step workflows')).toBeTruthy();
    });

    it('should render a runbook list', async () => {
      const { getByText } = await setup();
      expect(getByText('Runbook 1')).toBeTruthy();
      expect(getByText('Runbook 2')).toBeTruthy();
    });

    it('should render a new runbook button', async () => {
      const { getByText } = await setup();
      expect(getByText('New Runbook')).toBeTruthy();
    });
  });

  describe('navigation', () => {
    it('should navigate to a runbook', async () => {
      const { getByText } = await setup();
      expect(getByText('Runbook 1')).toBeTruthy();
      act(() => {
        getByText('Runbook 1').click();
      });
      expect(window.location.pathname).toEqual('/runbooks/1');
    });

    it('should navigate to a new runbook', async () => {
      const { getByText } = await setup();
      expect(getByText('New Runbook')).toBeTruthy();
      act(() => {
        getByText('New Runbook').click();
      });
      expect(window.location.pathname).toEqual('/runbooks/new');
    });
  });
});
