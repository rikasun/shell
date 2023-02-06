import { render } from '@testing-library/react';
import { StoreProvider } from 'easy-peasy';
import { BrowserRouter } from 'react-router-dom';
import { getMockStore } from '@cased/redux';

import NotFound from './not-found';

describe('NotFound', () => {
  it('should render successfully', () => {
    const { baseElement } = render(
      <StoreProvider store={getMockStore()}>
        <NotFound />
      </StoreProvider>,
      { wrapper: BrowserRouter },
    );

    expect(baseElement).toBeTruthy();
  });
});
