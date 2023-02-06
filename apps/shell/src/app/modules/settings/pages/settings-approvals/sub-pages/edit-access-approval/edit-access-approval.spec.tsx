import { fireEvent, render, waitFor } from '@testing-library/react';
import { BrowserRouter, Route, Routes } from 'react-router-dom';
import { StoreProvider } from 'easy-peasy';
import { settingsApprovalsService as SettingsApprovalsServiceType } from '@cased/remotes';
import { A } from '@cased/test-utilities';
import { getMockStore } from '@cased/redux';
import EditAccessApproval from './edit-access-approval';
import PageWrapper from '../../../../../../routes/page-wrapper';

describe('EditAccessApproval', () => {
  interface IOptions {
    getApprovalAccess?: jest.Mock;
    setApprovalAccess?: jest.Mock;
    pageId?: string;
    waitUntil?: (result: ReturnType<typeof render>) => void;
  }

  const setup = async (options: IOptions = {}) => {
    const {
      getApprovalAccess = jest
        .fn()
        .mockReturnValue(Promise.resolve(A.approvalProgram().build())),
      setApprovalAccess = jest.fn().mockReturnValue(Promise.resolve()),
      pageId = '1',
      waitUntil = (result) => result.getByTestId('edit-access-approval'),
    } = options;

    const settingsApprovalsService: Partial<
      typeof SettingsApprovalsServiceType
    > = {
      getApprovalAccess,
      setApprovalAccess,
    };

    global.console = { ...global.console, error: jest.fn() };

    window.history.pushState({}, '', `/settings/${pageId}`);
    const result = render(
      <StoreProvider store={getMockStore({ settingsApprovalsService })}>
        <Routes>
          <Route
            path="/settings/:id"
            element={
              <PageWrapper>
                <EditAccessApproval />
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

    expect(getByTestId('edit-access-approval')).toBeTruthy();
  });

  it('should submit the form with the approval service response after clicking submit', async () => {
    const program = A.approvalProgram().build();
    const getApprovalAccess = jest
      .fn()
      .mockReturnValue(Promise.resolve(program));
    const setApprovalAccess = jest.fn().mockReturnValue(Promise.resolve());

    const { getByText } = await setup({
      getApprovalAccess,
      setApprovalAccess,
    });

    fireEvent.click(getByText('Update Settings'));

    await waitFor(() =>
      expect(setApprovalAccess).toHaveBeenCalledWith(program.id, program),
    );
  });

  it('should handle a 404 page', async () => {
    const getApprovalAccess = jest
      .fn()
      .mockReturnValue(Promise.reject(new Error('404')));

    const { getByText } = await setup({
      getApprovalAccess,
      waitUntil: (result) => result.getByText('404'),
    });

    expect(getByText('404')).toBeTruthy();
  });

  describe('autosave', () => {
    it('should save when editing the session approval duration after 1.5 seconds', async () => {
      const setApprovalAccess = jest.fn().mockReturnValue(Promise.resolve());
      jest.useFakeTimers();

      const { getByLabelText } = await setup({ setApprovalAccess });
      const input = getByLabelText('Session approval duration (in minutes)');

      fireEvent.change(input, { target: { value: 22 } });
      jest.advanceTimersByTime(1500);

      await waitFor(() =>
        expect(setApprovalAccess).toHaveBeenCalledWith(
          '1',
          expect.objectContaining({ sessionApprovalDuration: 22 }),
        ),
      );
    });

    it('should not save when editing the approval duration immediately', async () => {
      const setApprovalAccess = jest.fn().mockReturnValue(Promise.resolve());
      jest.useFakeTimers();

      const { getByLabelText } = await setup({ setApprovalAccess });
      const input = getByLabelText('Session approval duration (in minutes)');
      fireEvent.change(input, { target: { value: 22 } });

      await waitFor(() => expect(setApprovalAccess).not.toHaveBeenCalled());
    });
  });
});
