import { render, waitFor } from '@testing-library/react';
import { StoreProvider } from 'easy-peasy';
import { BrowserRouter } from 'react-router-dom';
import { A } from '@cased/test-utilities';
import { getMockStore } from '@cased/redux';

import ApprovalCollection from './approval-collection';

describe('Approvals collection', () => {
  it('should render successfully', () => {
    const { getByText } = render(
      <StoreProvider
        store={getMockStore({
          approvalsService: {
            getAll: async () => [
              A.approval().withRequestorEmail('email@email.com').build(),
            ],
          },
        })}
      >
        <ApprovalCollection />
      </StoreProvider>,
      { wrapper: BrowserRouter },
    );
    waitFor(() => expect(getByText('email@email.com')).toBeTruthy());
  });
});
