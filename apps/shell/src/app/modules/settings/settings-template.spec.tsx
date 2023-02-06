import { render } from '@testing-library/react';
import { StoreProvider } from 'easy-peasy';
import { BrowserRouter } from 'react-router-dom';
import { getMockStore } from '@cased/redux';

import SettingsTemplate, { TabId } from './settings-template';

describe('Settings Template', () => {
  it('should render successfully', () => {
    const { baseElement } = render(
      <StoreProvider store={getMockStore()}>
        <SettingsTemplate activeTab={TabId.General}>content</SettingsTemplate>
      </StoreProvider>,
      {
        wrapper: BrowserRouter,
      },
    );
    expect(baseElement).toBeTruthy();
  });
});
