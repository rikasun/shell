import { fireEvent, render, waitFor } from '@testing-library/react';
import { StoreProvider } from 'easy-peasy';
import { BrowserRouter } from 'react-router-dom';
import { getMockStore } from '@cased/redux';

import CreateDatabase from './create-database';

describe('CreateDatabase', () => {
  interface IOptions {
    postDatabase?: jest.Mock;
  }

  const setup = async (options: IOptions = {}) => {
    const { postDatabase = jest.fn().mockReturnValue(Promise.resolve()) } =
      options;

    const settingsRunbooksService = {
      postDatabase,
    };

    global.console = { ...global.console, error: jest.fn() };

    const result = render(
      <StoreProvider store={getMockStore({ settingsRunbooksService })}>
        <CreateDatabase />
      </StoreProvider>,
      {
        wrapper: BrowserRouter,
      },
    );

    await waitFor(() => result.getByTestId('create-database'));

    return result;
  };

  it('should render successfully', async () => {
    const { baseElement } = await setup();

    expect(baseElement).toBeTruthy();
  });

  it('should fill in the form and submit to the API', async () => {
    const postDatabase = jest.fn().mockReturnValue(Promise.resolve());

    const name = 'My Database';
    const host = 'https://mydatabase.com';
    const port = '5432';
    const label = 'My Database';
    const username = 'username';
    const password = 'password';

    const { getByLabelText, getByTestId } = await setup({
      postDatabase,
    });

    const nameInput = getByLabelText('Database Name');
    const hostInput = getByLabelText('Host');
    const portInput = getByLabelText('Port');
    const labelInput = getByLabelText('Label');
    const usernameInput = getByLabelText('Username');
    const passwordInput = getByLabelText('Password');
    const form = getByTestId('database-form');

    fireEvent.change(nameInput, { target: { value: name } });
    fireEvent.change(hostInput, { target: { value: host } });
    fireEvent.change(portInput, { target: { value: port } });
    fireEvent.change(labelInput, { target: { value: label } });
    fireEvent.change(usernameInput, { target: { value: username } });
    fireEvent.change(passwordInput, { target: { value: password } });

    fireEvent.submit(form);

    await waitFor(() =>
      expect(postDatabase).toBeCalledWith({
        id: '',
        name,
        host,
        port,
        label,
        username,
        password,
      }),
    );
  });
});
