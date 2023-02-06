import { render, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import SettingsGuard from './ready-guard';

describe('ReadyGuard', () => {
  interface IOptions {
    waitUntil?: () => Promise<unknown>;
  }

  const setup = (options: IOptions = {}) => {
    const { waitUntil } = {
      waitUntil: () => Promise.resolve(),
      ...options,
    };

    return render(
      <SettingsGuard waitFor={waitUntil}>
        <div data-testid="done" />
      </SettingsGuard>,
      { wrapper: BrowserRouter },
    );
  };

  it('should render when the promise resolves', async () => {
    const waitUntil = () => Promise.resolve();

    const { getByTestId } = setup({ waitUntil });

    await waitFor(() => expect(getByTestId('done')).toBeTruthy());
  });
});
