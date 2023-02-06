import { render } from '@testing-library/react';
import { StoreProvider } from 'easy-peasy';
import { BrowserRouter } from 'react-router-dom';
import { getMockStore } from '@cased/redux';

import FormNodeShell from './form-node-shell';

describe('FormNodeShell', () => {
  it('should render successfully', () => {
    const { baseElement } = render(
      <StoreProvider store={getMockStore()}>
        <FormNodeShell onSubmit={() => {}} />
      </StoreProvider>,
      { wrapper: BrowserRouter },
    );

    expect(baseElement).toBeTruthy();
  });
});
