import { render, waitFor } from '@testing-library/react';
import { StoreProvider } from 'easy-peasy';
import { BrowserRouter, Route, Routes } from 'react-router-dom';
import { getMockStore } from '@cased/redux';

import Logout from './logout';

describe('Logout', () => {
  it('should render successfully', async () => {
    const successId = 'success';

    window.history.pushState({}, '', '/auth/logout');

    const { getByTestId } = render(
      <StoreProvider
        store={getMockStore({
          storageService: {
            clear: jest.fn(),
          },
        })}
      >
        <Routes>
          <Route path="/auth/logout" element={<Logout />} />
          <Route path="/" element={<div data-testid="success" />} />
        </Routes>
      </StoreProvider>,
      { wrapper: BrowserRouter },
    );

    await waitFor(() => getByTestId(successId));

    expect(getByTestId(successId)).toBeTruthy();
  });
});
