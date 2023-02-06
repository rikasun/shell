import { ApprovalStatus } from '@cased/data';
import { render, waitFor } from '@testing-library/react';
import { StoreProvider } from 'easy-peasy';
import { BrowserRouter, Route, Routes } from 'react-router-dom';
import { A } from '@cased/test-utilities';
import { getMockStore } from '@cased/redux';
import Show from './show-approval';

describe('Show', () => {
  it('should render successfully', async () => {
    window.history.pushState({}, '', '/approvals/1');
    const { getByText } = render(
      <StoreProvider
        store={getMockStore({
          approvalsService: {
            get: async () =>
              A.approval().withRequestorEmail('email@email.com').build(),
          },
        })}
      >
        <Routes>
          <Route path="/approvals/:id" element={<Show />} />
        </Routes>
      </StoreProvider>,
      { wrapper: BrowserRouter },
    );
    await waitFor(() => expect(getByText('email@email.com')).toBeTruthy());
  });

  it('should update approval successfully', async () => {
    window.history.pushState({}, '', '/approvals/1');
    const { getByText } = render(
      <StoreProvider
        store={getMockStore({
          approvalsService: {
            get: async () =>
              A.approval()
                .withStatus(ApprovalStatus.Open)
                .withRequestorEmail('email@email.com')
                .build(),
            update: async () =>
              A.approval().withStatus(ApprovalStatus.Cancelled).build(),
          },
        })}
      >
        <Routes>
          <Route path="/approvals/:id" element={<Show />} />
        </Routes>
      </StoreProvider>,
      { wrapper: BrowserRouter },
    );

    await waitFor(() => expect(getByText('Cancel')).toBeTruthy());

    // Click the Cancel Button
    const cancelButton = getByText('Cancel');
    cancelButton.click();

    // Check that the status is now Cancelled
    waitFor(() => expect(getByText('Cancelled')).toBeTruthy());
  });
});
