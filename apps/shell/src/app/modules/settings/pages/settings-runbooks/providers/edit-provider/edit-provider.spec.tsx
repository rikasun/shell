import { fireEvent, render, waitFor } from '@testing-library/react';
import { StoreProvider } from 'easy-peasy';
import { BrowserRouter, Route, Routes } from 'react-router-dom';
import { A } from '@cased/test-utilities';
import { getMockStore } from '@cased/redux';

import EditProvider from './edit-provider';
import PageWrapper from '../../../../../../routes/page-wrapper';

describe('EditProvider', () => {
  interface IOptions {
    getApiProvider?: jest.Mock;
    setApiProvider?: jest.Mock;
    waitUntil?: (result: ReturnType<typeof render>) => void;
  }

  const setup = async (options: IOptions = {}) => {
    const {
      getApiProvider = jest
        .fn()
        .mockReturnValue(Promise.resolve(A.apiProvider().build())),
      setApiProvider = jest.fn().mockReturnValue(Promise.resolve()),
      waitUntil = (result) => result.getByTestId('edit-provider'),
    } = options;

    const settingsRunbooksService = {
      getApiProvider,
      setApiProvider,
    };

    global.console = { ...global.console, error: jest.fn() };

    window.history.pushState({}, '', `/settings/1`);
    const result = render(
      <StoreProvider store={getMockStore({ settingsRunbooksService })}>
        <Routes>
          <Route
            path="/settings/:id"
            element={
              <PageWrapper>
                <EditProvider />
              </PageWrapper>
            }
          />
        </Routes>
      </StoreProvider>,
      {
        wrapper: BrowserRouter,
      },
    );

    await waitFor(() => waitUntil(result));

    return result;
  };

  it('should render successfully', async () => {
    const { getByTestId } = await setup();

    expect(getByTestId('edit-provider')).toBeTruthy();
  });

  it('should submit the form with a new name after clicking submit', async () => {
    const provider = A.apiProvider().withAuthType('token').build();
    const newName = 'new text';
    const getApiProvider = jest.fn().mockReturnValue(Promise.resolve(provider));
    const setApiProvider = jest.fn().mockReturnValue(Promise.resolve());

    const { getByTestId, getByLabelText } = await setup({
      getApiProvider,
      setApiProvider,
    });

    fireEvent.change(getByLabelText('API Name'), {
      target: { value: newName },
    });
    fireEvent.submit(getByTestId('provider-form'));

    await waitFor(() =>
      expect(setApiProvider).toHaveBeenCalledWith(provider.id, {
        ...provider,
        name: newName,
      }),
    );
  });

  it('should handle a 404 page', async () => {
    const getApiProvider = jest
      .fn()
      .mockReturnValue(Promise.reject(new Error('404')));

    const { getByText } = await setup({
      getApiProvider,
      waitUntil: (result) => result.getByText('404'),
    });

    expect(getByText('404')).toBeTruthy();
  });

  describe('autosave', () => {
    it('should save when editing the session approval duration after 1.5 seconds', async () => {
      const setApiProvider = jest.fn().mockReturnValue(Promise.resolve({}));
      jest.useFakeTimers();

      const { getByLabelText } = await setup({ setApiProvider });
      const input = getByLabelText('API Name');

      fireEvent.change(input, { target: { value: 'Meow' } });
      jest.advanceTimersByTime(1500);

      await waitFor(() =>
        expect(setApiProvider).toHaveBeenCalledWith(
          '1',
          expect.objectContaining({ name: 'Meow' }),
        ),
      );
    });

    it('should not save when editing the approval duration immediately', async () => {
      const setApiProvider = jest.fn().mockReturnValue(Promise.resolve());
      jest.useFakeTimers();

      const { getByLabelText } = await setup({ setApiProvider });
      const input = getByLabelText('API Name');
      fireEvent.change(input, { target: { value: 'Meow' } });

      await waitFor(() => expect(setApiProvider).not.toHaveBeenCalled());
    });
  });

  describe('password fields', () => {
    describe('basic auth', () => {
      describe('initial value', () => {
        it('should print "********" if a password is included in the response', async () => {
          const provider = A.apiProvider()
            .withAuthType('basic')
            .withHasPassword(true)
            .build();

          const getApiProvider = jest
            .fn()
            .mockReturnValue(Promise.resolve(provider));

          const { getByLabelText } = await setup({ getApiProvider });
          const passwordInput = getByLabelText('Password') as HTMLInputElement;

          expect(passwordInput.value).toBe('********');
        });

        it('should print an empty string if a password is not included in the response', async () => {
          const provider = A.apiProvider()
            .withAuthType('basic')
            .withHasPassword(false)
            .build();

          const getApiProvider = jest
            .fn()
            .mockReturnValue(Promise.resolve(provider));

          const { getByLabelText } = await setup({ getApiProvider });
          const passwordInput = getByLabelText('Password') as HTMLInputElement;

          expect(passwordInput.value).toBe('');
        });
      });

      describe('editing', () => {
        it('should submit a new password if the password is changed', async () => {
          jest.useFakeTimers();
          const provider = A.apiProvider().withAuthType('basic').build();

          const getApiProvider = jest
            .fn()
            .mockReturnValue(Promise.resolve(provider));

          const setApiProvider = jest.fn().mockReturnValue(Promise.resolve());

          const { getByLabelText, getAllByText } = await setup({
            getApiProvider,
            setApiProvider,
          });

          fireEvent.click(getAllByText('Edit')[0]);
          const passwordInput = getByLabelText('Password');

          fireEvent.change(passwordInput, {
            target: { value: 'new password' },
          });
          jest.advanceTimersByTime(1500);

          await waitFor(() =>
            expect(setApiProvider).toHaveBeenCalledWith(provider.id, {
              ...provider,
              password: 'new password',
            }),
          );
        });

        it('should submit an empty password if edit is clicked', async () => {
          jest.useFakeTimers();
          const provider = A.apiProvider().withAuthType('basic').build();

          const getApiProvider = jest
            .fn()
            .mockReturnValue(Promise.resolve(provider));

          const setApiProvider = jest.fn().mockReturnValue(Promise.resolve());

          const { getAllByText } = await setup({
            getApiProvider,
            setApiProvider,
          });

          fireEvent.click(getAllByText('Edit')[0]);
          jest.advanceTimersByTime(1500);

          await waitFor(() =>
            expect(setApiProvider).toHaveBeenCalledWith(provider.id, {
              ...provider,
              password: '',
            }),
          );
        });

        it('should not submit a password if the input is not edited', async () => {
          jest.useFakeTimers();
          const provider = A.apiProvider().withAuthType('basic').build();

          const getApiProvider = jest
            .fn()
            .mockReturnValue(Promise.resolve(provider));

          const setApiProvider = jest.fn().mockReturnValue(Promise.resolve());

          const { getByText } = await setup({
            getApiProvider,
            setApiProvider,
          });

          fireEvent.click(getByText('Save'));

          await waitFor(() =>
            expect(setApiProvider).not.toHaveBeenCalledWith(provider.id, {
              ...provider,
              password: '',
            }),
          );
        });
      });
    });

    describe('token auth', () => {
      describe('initial population', () => {
        it('should print "********" if a secret token is included in the response', async () => {
          const provider = A.apiProvider()
            .withAuthType('token')
            .withHasToken(true)
            .build();

          const getApiProvider = jest
            .fn()
            .mockReturnValue(Promise.resolve(provider));

          const { getByLabelText } = await setup({ getApiProvider });
          const passwordInput = getByLabelText(
            'Secret Token',
          ) as HTMLInputElement;

          expect(passwordInput.value).toBe('********');
        });

        it('should print an empty string if a secret token is not included in the response', async () => {
          const provider = A.apiProvider()
            .withAuthType('token')
            .withHasToken(false)
            .build();

          const getApiProvider = jest
            .fn()
            .mockReturnValue(Promise.resolve(provider));

          const { getByLabelText } = await setup({ getApiProvider });
          const passwordInput = getByLabelText(
            'Secret Token',
          ) as HTMLInputElement;

          expect(passwordInput.value).toBe('');
        });
      });

      describe('editing', () => {
        it('should submit a new secret token if the secret token is changed', async () => {
          jest.useFakeTimers();
          const provider = A.apiProvider().withAuthType('token').build();

          const getApiProvider = jest
            .fn()
            .mockReturnValue(Promise.resolve(provider));

          const setApiProvider = jest.fn().mockReturnValue(Promise.resolve());

          const { getByLabelText, getAllByText } = await setup({
            getApiProvider,
            setApiProvider,
          });

          fireEvent.click(getAllByText('Edit')[1]);
          const passwordInput = getByLabelText('Secret Token');

          fireEvent.change(passwordInput, {
            target: { value: 'new secret' },
          });
          jest.advanceTimersByTime(1500);

          await waitFor(() =>
            expect(setApiProvider).toHaveBeenCalledWith(provider.id, {
              ...provider,
              secretToken: 'new secret',
            }),
          );
        });
      });
    });
  });
});
