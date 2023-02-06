import { render } from '@testing-library/react';
import { StoreProvider } from 'easy-peasy';
import { BrowserRouter } from 'react-router-dom';
import { getMockStore } from '@cased/redux';

import NotFoundGuard from './not-found-guard';

describe('NotFoundGuard', () => {
  it('should render successfully', () => {
    const { baseElement } = render(
      <StoreProvider store={getMockStore()}>
        <NotFoundGuard />
      </StoreProvider>,
      { wrapper: BrowserRouter },
    );

    expect(baseElement).toBeTruthy();
  });
});
