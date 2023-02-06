import { render } from '@testing-library/react';
import { StoreProvider } from 'easy-peasy';
import { BrowserRouter } from 'react-router-dom';
import { getMockStore } from '@cased/redux';
import FormNodeRest from './form-node-rest';

describe('FormNodeRest', () => {
  it('should render successfully', () => {
    const { baseElement } = render(
      <StoreProvider store={getMockStore()}>
        <FormNodeRest onSubmit={() => {}} headers={[]} queryParameters={[]} />
      </StoreProvider>,
      { wrapper: BrowserRouter },
    );

    expect(baseElement).toBeTruthy();
  });
});
