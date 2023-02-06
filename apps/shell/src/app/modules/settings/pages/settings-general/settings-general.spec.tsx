import { StoreProvider } from 'easy-peasy';
import { BrowserRouter } from 'react-router-dom';
import { fireEvent, render, waitFor } from '@testing-library/react';
import { settingsService as SettingsServiceType } from '@cased/remotes';
import { A } from '@cased/test-utilities';

import { getMockStore } from '@cased/redux';
import SettingsGeneral from './settings-general';

describe('SettingsGeneral', () => {
  interface IOptions {
    settingsService?: Partial<typeof SettingsServiceType>;
  }

  const setup = (options: IOptions = {}) => {
    const { settingsService } = {
      settingsService: {
        getAllSettings: () => Promise.resolve(A.settingsResponse().build()),
      },
      ...options,
    };

    return render(
      <StoreProvider
        store={getMockStore({
          settingsService,
        })}
      >
        <SettingsGeneral />
      </StoreProvider>,
      { wrapper: BrowserRouter },
    );
  };

  it('should render successfully', async () => {
    const { getByTestId } = setup();

    await waitFor(() => expect(getByTestId('settings-general')).toBeTruthy());
  });

  describe('reason required input', () => {
    it('can show reason required', async () => {
      const settings = A.settingsResponse().withReasonRequired(true).build();
      const settingsService = {
        getAllSettings: () => Promise.resolve(settings),
      };

      const { getByTestId } = setup({ settingsService });

      await waitFor(() =>
        expect(getByTestId('settings-general__reason-required')).toBeTruthy(),
      );
    });

    it('can update reason required', async () => {
      const settings = A.settingsResponse().withReasonRequired(false).build();
      const settingsService = {
        getAllSettings: () => Promise.resolve(settings),
        setReasonRequired: () => Promise.resolve(true),
      };

      const { getByTestId } = setup({ settingsService });

      await waitFor(() =>
        expect(
          getByTestId('settings-general__reason-required').getAttribute(
            'checked',
          ),
        ).toEqual(null),
      );

      fireEvent.click(getByTestId('settings-general__reason-required'));

      // should test that checkbox is checked
      await waitFor(() =>
        expect(
          getByTestId('settings-general__reason-required').getAttribute(
            'checked',
          ),
        ).toEqual(null),
      );
    });
  });

  describe('GitHub connection', () => {
    it('should connect to organization', async () => {
      const settings = A.settingsResponse().build();
      const settingsService = {
        getAllSettings: () => Promise.resolve(settings),
      };

      const { getByText, getByLabelText, getByTestId } = setup({
        settingsService,
      });
      await waitFor(() =>
        expect(getByText('Create a GitHub App')).toBeTruthy(),
      );

      fireEvent.change(getByLabelText('Organization Name'), {
        target: { value: 'cased' },
      });

      await waitFor(() =>
        expect(
          getByTestId('settings-github-connection__form').outerHTML,
        ).toContain(
          'https://github.com/organizations/cased/settings/apps/new?state=1234',
        ),
      );
    });

    it('should remove organization', async () => {
      const settings = A.settingsResponse().withghAppUrl('http://').build();
      const settingsService = {
        getAllSettings: () => Promise.resolve(settings),
        disconnectFromGitHub: () => Promise.resolve(),
      };

      const { getByText } = setup({ settingsService });
      await waitFor(() =>
        expect(getByText('Remove GitHub App Credentials')).toBeTruthy(),
      );

      // should test remove button works
    });
  });
});
