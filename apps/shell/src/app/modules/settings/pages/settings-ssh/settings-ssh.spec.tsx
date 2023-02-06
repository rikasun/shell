import { fireEvent, render, waitFor } from '@testing-library/react';
import { StoreProvider } from 'easy-peasy';
import { BrowserRouter } from 'react-router-dom';
import { settingsService as SettingsServiceType } from '@cased/remotes';
import { A } from '@cased/test-utilities';

import { getMockStore } from '@cased/redux';
import SettingsSsh from './settings-ssh';

describe('SettingsSsh', () => {
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
        <SettingsSsh />
      </StoreProvider>,
      { wrapper: BrowserRouter },
    );
  };

  it('should render successfully', async () => {
    const { getByTestId } = setup();

    await waitFor(() => expect(getByTestId('settings-ssh')).toBeTruthy());
  });

  describe('certificate authentication input', () => {
    it('should populate the CA text when checked', async () => {
      const settings = A.settingsResponse().withCa(true).build();
      const settingsService = {
        getAllSettings: () => Promise.resolve(settings),
      };

      const { getByTestId } = setup({ settingsService });

      await waitFor(() =>
        expect(getByTestId('settings-ssh__ca-text')).toBeTruthy(),
      );
    });

    it('should not populate the CA text when input is unchecked', async () => {
      const settings = A.settingsResponse().withCa(false).build();
      const settingsService = {
        getAllSettings: () => Promise.resolve(settings),
      };

      const { queryByTestId, getByTestId } = setup({ settingsService });

      await waitFor(() => getByTestId('settings-ssh'));
      const text = queryByTestId('settings-ssh__ca-text');
      expect(text).toBeFalsy();
    });

    it('should show the CA display when clicked', async () => {
      const settings = A.settingsResponse().withCa(false).build();
      const settingsService = {
        getAllSettings: () => Promise.resolve(settings),
        setCaEnabled: () => Promise.resolve(true),
      };

      const { getByTestId, getByLabelText } = setup({ settingsService });
      await waitFor(() => getByTestId('settings-ssh'));

      fireEvent.click(getByLabelText('Enable Certificate Authentication'));

      await waitFor(() =>
        expect(getByTestId('settings-ssh__ca-text')).toBeTruthy(),
      );
    });
  });
});
