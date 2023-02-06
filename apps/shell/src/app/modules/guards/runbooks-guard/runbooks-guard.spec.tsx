import { render, waitFor } from '@testing-library/react';
import { StoreProvider } from 'easy-peasy';
import { getMockStore } from '@cased/redux';

import RunbooksGuard from './runbooks-guard';

describe('RunbooksGuard', () => {
  it('should render successfully', () => {
    const { baseElement, queryByTestId } = render(
      <StoreProvider store={getMockStore()}>
        <RunbooksGuard>
          <p data-testid="test">test</p>
        </RunbooksGuard>
      </StoreProvider>,
    );

    waitFor(() => {
      expect(queryByTestId('test')).toBeTruthy();
    });

    expect(baseElement).toBeTruthy();
  });
});
