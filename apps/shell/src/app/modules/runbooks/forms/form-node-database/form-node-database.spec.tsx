import { render } from '@testing-library/react';
import { StoreProvider } from 'easy-peasy';
import { BrowserRouter } from 'react-router-dom';
import { getMockStore } from '@cased/redux';

import FormNodeDatabase from './form-node-database';

describe('FormNodeDatabase', () => {
  it('should render successfully', () => {
    const { baseElement } = render(
      <StoreProvider store={getMockStore()}>
        <FormNodeDatabase onSubmit={() => {}} />
      </StoreProvider>,
      { wrapper: BrowserRouter },
    );

    expect(baseElement).toBeTruthy();
  });
});
