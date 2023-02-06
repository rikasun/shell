import { IApproval } from '@cased/remotes';
import { fireEvent, render, waitFor } from '@testing-library/react';
import { StoreProvider } from 'easy-peasy';
import { act } from 'react-dom/test-utils';
import { BrowserRouter } from 'react-router-dom';
import { getMockStore } from '@cased/redux';
import SettingsApprovals from './settings-approvals';

describe('SettingsApprovals', () => {
  interface IOptions {
    access?: IApproval[];
    programs?: IApproval[];
  }

  const setup = async (options: IOptions = {}) => {
    const { access = [], programs = [] } = options;

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const settingsService: any = {
      approvals: {
        getApprovals: () => Promise.resolve({ access, programs }),
        deleteProgramApproval: () => Promise.resolve(),
      },
    };

    const result = render(
      <StoreProvider store={getMockStore({ settingsService })}>
        <SettingsApprovals />
      </StoreProvider>,
      {
        wrapper: BrowserRouter,
      },
    );

    await waitFor(() => result.getByTestId('program-approvals'));

    return result;
  };

  it('should render successfully', async () => {
    const { baseElement } = await setup();

    expect(baseElement).toBeTruthy();
  });

  describe('program approvals', () => {
    const programs = [
      {
        id: '1',
        name: 'Program 22',
      },
    ];

    it('should print the API response', async () => {
      const { getByText } = await setup({ programs });
      await waitFor(() => getByText(programs[0].name));

      expect(getByText(programs[0].name).textContent).toBeTruthy();
    });

    describe('after clicking delete on an approval', () => {
      it('should delete when confirming', async () => {
        const confirm = true;
        const targetText = programs[0].name;

        window.confirm = jest.fn(() => confirm);
        const { getByText, queryAllByText } = await setup({ programs });

        act(() => {
          fireEvent.click(getByText('Delete'));
        });

        await waitFor(() =>
          expect(queryAllByText(targetText).length).toBeFalsy(),
        );
      });

      it('should not delete when canceling the confirm', async () => {
        const confirm = false;
        const targetText = programs[0].name;

        window.confirm = jest.fn(() => confirm);
        const { getByText } = await setup({ programs });

        act(() => {
          fireEvent.click(getByText('Delete'));
        });

        await waitFor(() => expect(getByText(targetText)).toBeTruthy());
      });
    });
  });

  describe('access approvals', () => {
    it('should print the API response', async () => {
      const access = [
        {
          id: '1',
          name: 'Access 22',
        },
      ];

      const { getByText } = await setup({ access });
      await waitFor(() => getByText(access[0].name));

      expect(getByText(access[0].name).textContent).toBeTruthy();
    });
  });
});
