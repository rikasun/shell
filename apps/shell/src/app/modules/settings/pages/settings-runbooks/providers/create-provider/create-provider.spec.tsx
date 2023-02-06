import { fireEvent, render, waitFor } from '@testing-library/react';
import { StoreProvider } from 'easy-peasy';
import { BrowserRouter } from 'react-router-dom';
import { getMockStore } from '@cased/redux';

import CreateProvider from './create-provider';

describe('CreateProvider', () => {
  interface IOptions {
    postApiProvider?: jest.Mock;
  }

  const setup = async (options: IOptions = {}) => {
    const { postApiProvider = jest.fn().mockReturnValue(Promise.resolve()) } =
      options;

    const settingsRunbooksService = {
      postApiProvider,
    };

    global.console = { ...global.console, error: jest.fn() };

    const result = render(
      <StoreProvider store={getMockStore({ settingsRunbooksService })}>
        <CreateProvider />
      </StoreProvider>,
      {
        wrapper: BrowserRouter,
      },
    );

    await waitFor(() => result.getByTestId('create-provider'));

    return result;
  };

  it('should render successfully', async () => {
    const { baseElement } = await setup();

    expect(baseElement).toBeTruthy();
  });

  it('should fill in the form and submit to the API', async () => {
    const postApiProvider = jest.fn().mockReturnValue(Promise.resolve());

    const name = 'My API';
    const baseUrl = 'https://myapi.com';
    const authType = 'basic';
    const username = 'username';
    const password = 'password';

    const { getByLabelText, getByTestId } = await setup({
      postApiProvider,
    });

    const nameInput = getByLabelText('API Name');
    const urlInput = getByLabelText('Base URL');
    const usernameInput = getByLabelText('Username');
    const passwordInput = getByLabelText('Password');
    const form = getByTestId('provider-form');

    fireEvent.change(nameInput, { target: { value: name } });
    fireEvent.change(urlInput, { target: { value: baseUrl } });
    fireEvent.change(usernameInput, { target: { value: username } });
    fireEvent.change(passwordInput, { target: { value: password } });
    fireEvent.submit(form);

    await waitFor(() =>
      expect(postApiProvider).toHaveBeenCalledWith({
        id: '',
        name,
        baseUrl,
        authType,
        username,
        password,
        authToken: '',
        secretToken: '',
      }),
    );
  });
});
