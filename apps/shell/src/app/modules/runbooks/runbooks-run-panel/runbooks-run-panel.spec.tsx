import { AllBlocks, FieldType, INodeRunResultData } from '@cased/data';
import { IRunbookGetResponse } from '@cased/remotes';
import { fireEvent, render, waitFor } from '@testing-library/react';
import { StoreProvider } from 'easy-peasy';
import { BrowserRouter, Route, Routes } from 'react-router-dom';
import { A, mockReactFlow } from '@cased/test-utilities';
import { getMockStore } from '@cased/redux';
import Runbooks from '../runbooks';

describe('Runbooks run panel', () => {
  interface IOptions {
    initialBlocks?: AllBlocks[];
    runRunbookResponse?: INodeRunResultData;
  }
  const setup = async (options: IOptions = {}) => {
    const { initialBlocks, runRunbookResponse } = options;

    const populateResponse: IRunbookGetResponse = {
      runbook: {
        id: 1,
        name: '',
        description: '',
        blocks: initialBlocks || [A.blockText().build()],
      },
      prompts: [{ slug: 'demo-bastion-1' }],
      databases: [{ label: 'my database', id: '1' }],
      api_providers: [{ api_name: 'my api', id: '1' }],
    };

    window.history.pushState({}, '', '/runbooks/1?mode=view');
    mockReactFlow();

    const result = render(
      <StoreProvider
        store={getMockStore({
          populateResponse,
          runRunbookResponse,
        })}
      >
        <Routes>
          <Route path="/runbooks/:id" element={<Runbooks />} />
        </Routes>
      </StoreProvider>,
      { wrapper: BrowserRouter },
    );

    await waitFor(() => {
      if (
        populateResponse.runbook.blocks.length > 0 &&
        populateResponse.runbook.blocks[0].name
      )
        return result.getByText(populateResponse.runbook.blocks[0].name);

      return result.getByText('Create A Node');
    });

    return result;
  };

  it('should render successfully', async () => {
    const { getByText } = await setup();
    expect(getByText('Run Runbook')).toBeTruthy();
  });

  describe('Run runbook interaction', () => {
    const nameOne = 'My Block';
    const idOne = 3;
    const nameTwo = 'My Other Block';
    const idTwo = 2;
    it('should run the runbook', async () => {
      const initialBlocks = [
        A.blockShell().withName(nameOne).withId(idOne).build(),
        A.blockText().withName(nameTwo).withId(idTwo).build(),
      ];

      const runRunbookResponse = {
        '3': {
          stdout_exit_status: 0,
          stderr_exit_status: 0,
          stdout: 'system',
          stderr: '',
        },
      };

      const { getByText } = await setup({ initialBlocks, runRunbookResponse });
      fireEvent.click(getByText('Run Runbook'));

      await waitFor(() => {
        expect(getByText('system')).toBeTruthy();
      });
    });

    it('should take form user input and run the runbook', async () => {
      const initialBlocks = [
        A.blockForm()
          .withName(nameOne)
          .withId(idOne)
          .withField('email', FieldType.Text, [])
          .withField('city', FieldType.Dropdown, [
            { label: 'new york', id: '22', value: 'new-york' },
          ])
          .withField('fruit', FieldType.Radio, [
            { label: 'apple', id: '33', value: 'apple' },
          ])
          .build(),
        A.blockDatabase().withId(idTwo).withName(nameTwo).build(),
      ];

      const runRunbookResponse = {
        '2': {
          exit_status: 0,
          output: 'yearly',
        },
      };

      const { getByText, getByTestId } = await setup({
        initialBlocks,
        runRunbookResponse,
      });

      fireEvent.change(getByTestId('runbooks-run-panel-email'), {
        target: { value: 'a@b.com' },
      });
      fireEvent.change(getByTestId('runbooks-run-panel-city'), {
        target: { value: 'new-york' },
      });
      fireEvent.click(getByText('apple'));
      fireEvent.click(getByText('Run Runbook'));

      await waitFor(() => {
        expect(getByText('yearly')).toBeTruthy();
      });
    });

    it('should show failed runbook', async () => {
      const initialBlocks = [
        A.blockShell().withName(nameOne).withId(idOne).build(),
        A.blockText().withName(nameTwo).withId(idTwo).build(),
      ];

      const runRunbookResponse = {
        '3': {
          stdout_exit_status: 1,
          stderr_exit_status: 0,
          stdout: '',
          stderr: '',
        },
      };

      const { getByText } = await setup({ initialBlocks, runRunbookResponse });
      fireEvent.click(getByText('Run Runbook'));

      await waitFor(() => {
        expect(getByText('Failed')).toBeTruthy();
      });
    });

    it('should not be able to click on a node', async () => {
      const initialBlocks = [
        A.blockForm()
          .withName(nameOne)
          .withId(idOne)
          .withField('email', FieldType.Text, [])
          .withField('city', FieldType.Dropdown, [
            { label: 'new york', id: '22', value: 'new-york' },
          ])
          .withField('fruit', FieldType.Radio, [
            { label: 'apple', id: '33', value: 'apple' },
          ])
          .build(),
        A.blockDatabase().withId(idTwo).withName(nameTwo).build(),
      ];

      const { getByText } = await setup({ initialBlocks });
      fireEvent.click(getByText(nameOne));

      expect(getByText('Run Runbook')).toBeTruthy();
    });
  });
});
