import { render } from '@testing-library/react';
import { StoreProvider } from 'easy-peasy';
import { getMockStore } from '@cased/redux';
import FormNodeForm from './form-node-form';

describe('FormNodeForm', () => {
  it('should render successfully', () => {
    const { baseElement } = render(
      <StoreProvider store={getMockStore()}>
        <FormNodeForm onSubmit={() => {}} fields={[]} />
      </StoreProvider>,
    );
    expect(baseElement).toBeTruthy();
  });
});
