import { fireEvent, render, waitFor } from '@testing-library/react';
import { StoreProvider } from 'easy-peasy';
import { BrowserRouter, Route, Routes } from 'react-router-dom';
import { A } from '@cased/test-utilities';
import { getMockStore } from '@cased/redux';

import EditDatabase from './edit-database';
import PageWrapper from '../../../../../../routes/page-wrapper';

describe('EditDatabase', () => {
  interface IOptions {
    getDatabase?: jest.Mock;
    patchDatabase?: jest.Mock;
    waitUntil?: (result: ReturnType<typeof render>) => void;
  }

  const setup = async (options: IOptions = {}) => {
    const {
      getDatabase = jest.fn().mockReturnValue(A.runbookDatabase().build()),
      patchDatabase = jest.fn().mockReturnValue(Promise.resolve()),
      waitUntil = (result) => result.getByTestId('edit-database'),
    } = options;

    const settingsRunbooksService = {
      getDatabase,
      patchDatabase,
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
                <EditDatabase />
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

    expect(getByTestId('edit-database')).toBeTruthy();
  });

  it('should submit the form with a new name after clicking submit', async () => {
    const database = A.runbookDatabase().build();
    const newName = 'new text';
    const getDatabase = jest.fn().mockReturnValue(database);
    const patchDatabase = jest.fn().mockReturnValue(Promise.resolve());

    const { getByTestId, getByLabelText } = await setup({
      getDatabase,
      patchDatabase,
    });

    fireEvent.change(getByLabelText('Database Name'), {
      target: { value: newName },
    });
    fireEvent.submit(getByTestId('database-form'));

    await waitFor(() => {
      expect(patchDatabase).toHaveBeenCalledWith('1', {
        ...database,
        id: database.id,
        name: newName,
      });
    });
  });

  it('should handle a 404 page', async () => {
    const getDatabase = jest
      .fn()
      .mockReturnValue(Promise.reject(new Error('404')));

    const { getByText } = await setup({
      getDatabase,
      waitUntil: (result) => result.getByText('404'),
    });

    expect(getByText('404')).toBeTruthy();
  });

  describe('autosave', () => {
    it('should autosave the form after 1.5 seconds of inactivity', async () => {
      const newName = 'new text';
      const patchDatabase = jest.fn().mockReturnValue(Promise.resolve());
      jest.useFakeTimers();

      const { getByLabelText } = await setup({
        patchDatabase,
      });

      fireEvent.change(getByLabelText('Database Name'), {
        target: { value: newName },
      });
      jest.advanceTimersByTime(1500);

      await waitFor(() => {
        expect(patchDatabase).toHaveBeenCalledWith(
          '1',
          expect.objectContaining({ name: newName }),
        );
      });
    });

    it('should not autosave the form if the form is invalid', async () => {
      const newName = 'new text';
      const patchDatabase = jest.fn().mockReturnValue(Promise.resolve());
      jest.useFakeTimers();

      const { getByLabelText } = await setup({
        patchDatabase,
      });

      fireEvent.change(getByLabelText('Database Name'), {
        target: { value: newName },
      });

      await waitFor(() => {
        expect(patchDatabase).not.toHaveBeenCalled();
      });
    });
  });

  describe('password', () => {
    it('should print out "********" if the database has a password', async () => {
      const database = A.runbookDatabase().withHasPassword(true).build();
      const getDatabase = jest.fn().mockReturnValue(database);

      const { getByLabelText } = await setup({
        getDatabase,
      });

      expect(getByLabelText('Password').getAttribute('value')).toBe('********');
    });

    it('should submit a new password when editing the password input', async () => {
      const database = A.runbookDatabase().build();
      const newPassword = 'new password';
      const getDatabase = jest.fn().mockReturnValue(database);
      const patchDatabase = jest.fn().mockReturnValue(Promise.resolve());

      const { getByLabelText, getByText } = await setup({
        getDatabase,
        patchDatabase,
      });

      fireEvent.click(getByText('Edit'));

      fireEvent.change(getByLabelText('Password'), {
        target: { value: newPassword },
      });

      fireEvent.click(getByText('Save'));

      await waitFor(() => {
        expect(patchDatabase).toHaveBeenCalledWith(
          '1',
          expect.objectContaining({ password: newPassword }),
        );
      });
    });
  });
});
