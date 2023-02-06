import { IRunbookResponse } from '@cased/remotes';
import { fireEvent, render, waitFor } from '@testing-library/react';
import { StoreProvider } from 'easy-peasy';
import { BrowserRouter } from 'react-router-dom';
import { mockReactFlow } from '@cased/test-utilities';
import { getMockStore } from '@cased/redux';

import NewRunbook from './new-runbook';

describe('New Runbook', () => {
  interface IOptions {
    createRunbookResponse?: IRunbookResponse;
  }
  const setup = async (options: IOptions = {}) => {
    const { createRunbookResponse } = options;

    window.history.pushState({}, 'Init', '/runbooks/new');
    mockReactFlow();

    const result = render(
      <StoreProvider store={getMockStore({ createRunbookResponse })}>
        <NewRunbook />
      </StoreProvider>,
      { wrapper: BrowserRouter },
    );

    return result;
  };

  it('should render successfully', async () => {
    const { getByTestId } = await setup();
    expect(getByTestId('new-runbook')).toBeTruthy();
  });

  describe('create runbook', () => {
    it('should create a runbook', async () => {
      const createRunbookResponse: IRunbookResponse = {
        id: 1,
        name: 'Runbook 1',
        description: 'Runbook 1 description',
        blocks: [],
      };
      const { getByLabelText, getByText } = await setup({
        createRunbookResponse,
      });

      fireEvent.change(getByLabelText('Name'), {
        target: { value: 'Runbook 1' },
      });
      fireEvent.change(getByLabelText('Description'), {
        target: { value: 'Runbook 1 description' },
      });
      fireEvent.click(getByText('Submit'));

      await waitFor(() => {
        expect(window.location.pathname).toEqual('/runbooks/1');
      });
    });
  });
});
