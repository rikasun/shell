import { settingsApprovalsService as SettingsApprovalsServiceType } from '@cased/remotes';
import { fireEvent, render, waitFor } from '@testing-library/react';
import { StoreProvider } from 'easy-peasy';
import { BrowserRouter, Route, Routes } from 'react-router-dom';
import { getMockStore } from '@cased/redux';

import NewApproval from './new-approval';

describe('NewApproval', () => {
  interface IOptions {
    settingsApprovalsService?: Partial<typeof SettingsApprovalsServiceType>;
  }

  const setup = async (option: IOptions = {}) => {
    const { settingsApprovalsService = {} } = option;

    window.history.pushState({}, 'Init', '/settings/approvals/programs/new');
    const result = render(
      <StoreProvider store={getMockStore({ settingsApprovalsService })}>
        <Routes>
          <Route
            path="/settings/approvals/programs/new"
            element={<NewApproval />}
          />
          <Route
            path="/settings/approvals/programs/1"
            element={<div data-testid="new-page" />}
          />
        </Routes>
      </StoreProvider>,
      { wrapper: BrowserRouter },
    );

    await waitFor(() => result.getByTestId('new-approval'));

    return result;
  };

  it('should render successfully', async () => {
    const { getByTestId } = await setup();

    expect(getByTestId('new-approval')).toBeTruthy();
  });

  it('should redirect after submitting to the new approval page', async () => {
    const description = 'My custom description';
    const settingsApprovalsService = {
      createProgramApproval: jest
        .fn()
        .mockReturnValue(Promise.resolve({ id: '1' })),
    };

    const { getByTestId, getByLabelText, getByText } = await setup({
      settingsApprovalsService,
    });

    const railsButton = getByTestId('new-approval__program-rails');
    fireEvent.click(railsButton);

    const descriptionInput = getByLabelText('Description');
    fireEvent.change(descriptionInput, { target: { value: description } });

    const submitButton = getByText('Create Approval Program');
    fireEvent.click(submitButton);

    await waitFor(() => expect(getByTestId('new-page')));
  });

  it('should submit the form to the settings approvals service', async () => {
    const description = 'My custom description';
    const settingsApprovalsService = {
      createProgramApproval: jest
        .fn()
        .mockReturnValue(Promise.resolve({ id: '1' })),
    };

    const { getByTestId, getByText, getByLabelText } = await setup({
      settingsApprovalsService,
    });

    const railsButton = getByTestId('new-approval__program-rails');
    fireEvent.click(railsButton);

    const descriptionInput = getByLabelText('Description');
    fireEvent.change(descriptionInput, { target: { value: description } });

    const submitButton = getByText('Create Approval Program');
    fireEvent.click(submitButton);

    await waitFor(() => getByTestId('new-page'));

    expect(settingsApprovalsService.createProgramApproval).toHaveBeenCalledWith(
      'rails',
      description,
    );
  });
});
