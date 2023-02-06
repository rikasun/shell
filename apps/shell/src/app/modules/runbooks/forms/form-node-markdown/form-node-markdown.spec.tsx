import { render } from '@testing-library/react';
import { StoreProvider } from 'easy-peasy';
import { getMockStore } from '@cased/redux';

import FormNodeMarkdown from './form-node-markdown';

describe('FormNodeMarkdown', () => {
  it('should render successfully', () => {
    const { baseElement } = render(
      <StoreProvider store={getMockStore()}>
        <FormNodeMarkdown onSubmit={() => {}} />
      </StoreProvider>,
    );
    expect(baseElement).toBeTruthy();
  });
});
