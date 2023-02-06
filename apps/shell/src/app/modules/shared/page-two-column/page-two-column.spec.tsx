import { render } from '@testing-library/react';
import { StoreProvider } from 'easy-peasy';
import { BrowserRouter } from 'react-router-dom';
import { getMockStore } from '@cased/redux';

import PageDefault from './page-two-column';

describe('PageTwoColumn', () => {
  it('should render successfully', () => {
    const { baseElement } = render(
      <StoreProvider store={getMockStore()}>
        <PageDefault>Test</PageDefault>
      </StoreProvider>,
      {
        wrapper: BrowserRouter,
      },
    );
    expect(baseElement).toBeTruthy();
  });
});
