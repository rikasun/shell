import { render } from '@testing-library/react';
import { StoreProvider } from 'easy-peasy';
import { getMockStore } from '@cased/redux';

import Loading from './loading';

describe('Loading', () => {
  it('should render successfully', () => {
    const { baseElement } = render(
      <StoreProvider store={getMockStore()}>
        <Loading />
      </StoreProvider>,
    );
    expect(baseElement).toBeTruthy();
  });
});
