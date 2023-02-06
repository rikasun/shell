import { render } from '@testing-library/react';
import { StoreProvider } from 'easy-peasy';
import { getMockStore } from '@cased/redux';

import NotificationList from './notification-list';

describe('NotificationList', () => {
  it('should render successfully', () => {
    const { baseElement } = render(
      <StoreProvider store={getMockStore()}>
        <NotificationList />
      </StoreProvider>,
    );
    expect(baseElement).toBeTruthy();
  });
});
