import { AllBlocks, FieldType } from '@cased/data';
import { IRunbookGetResponse } from '@cased/remotes';
import {
  render,
  waitFor,
  fireEvent,
  waitForElementToBeRemoved,
} from '@testing-library/react';
import { StoreProvider } from 'easy-peasy';
import { BrowserRouter, Route, Routes } from 'react-router-dom';
import { A, mockReactFlow } from '@cased/test-utilities';
import { getMockStore } from '@cased/redux';

import Runbooks from './runbooks';

describe('Runbooks', () => {
  interface IOptions {
    initialBlocks?: AllBlocks[];
    createBlockResponse?: AllBlocks;
    updateBlockResponse?: AllBlocks;
  }

  const setup = async (options: IOptions = {}) => {
    const { initialBlocks, createBlockResponse, updateBlockResponse } = options;

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

    window.history.pushState({}, '', '/runbooks/1');
    mockReactFlow();

    const result = render(
      <StoreProvider
        store={getMockStore({
          populateResponse,
          createBlockResponse,
          updateBlockResponse,
        })}
      >
        <Routes>
          <Route path="/runbooks/:id" element={<Runbooks />} />
        </Routes>
      </StoreProvider>,
      { wrapper: BrowserRouter },
    );

    // Make sure a block has rendered. Otherwise async events might be kicking around under the hood resulting in dreaded React act errors
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
    const { getByTestId } = await setup();

    expect(getByTestId('runbooks')).toBeTruthy();
  });

  describe('initial population', () => {
    const name = 'My Block';

    it('should show a shell block', async () => {
      const initialBlocks = [A.blockShell().withName(name).build()];

      const { getByText } = await setup({ initialBlocks });

      expect(getByText(name)).toBeTruthy();
    });

    it('should show a database block', async () => {
      const initialBlocks = [A.blockDatabase().withName(name).build()];

      const { getByText } = await setup({ initialBlocks });

      expect(getByText(name)).toBeTruthy();
    });

    it('should show a rest block', async () => {
      const initialBlocks = [A.blockRest().withName(name).build()];

      const { getByText } = await setup({ initialBlocks });

      expect(getByText(name)).toBeTruthy();
    });

    it('should show a form block', async () => {
      const initialBlocks = [A.blockForm().withName(name).build()];

      const { getByText } = await setup({ initialBlocks });

      expect(getByText(name)).toBeTruthy();
    });

    it('should show the create panel if there are no blocks', async () => {
      const createPanelText = 'Create A Node';
      const initialBlocks: AllBlocks[] = [];

      const { getByText } = await setup({ initialBlocks });

      expect(getByText(createPanelText)).toBeTruthy();
    });
  });

  describe('node interactions', () => {
    const initialBlocks = [
      A.blockText().withName('With name').build(),
      A.blockText().withId(2).build(),
    ];

    // Temporarily disabled until we add the ability to insert nodes via parent child relationships
    xit('should add a node when clicking +', async () => {
      const { getByText, getByTestId } = await setup({ initialBlocks });
      await waitFor(() => {
        getByTestId('edge-add');
      });

      fireEvent.click(getByTestId('edge-add'));

      expect(getByText('Edge Click Node')).toBeTruthy();
    });

    it('should delete a node when clicking delete', async () => {
      jest.spyOn(window, 'confirm').mockReturnValue(true);

      const { getByText, queryByText } = await setup({
        initialBlocks,
      });

      fireEvent.click(getByText('With name'));
      fireEvent.click(getByText('Delete'));
      await waitForElementToBeRemoved(() => queryByText('With name'));

      expect(queryByText('With name')).toBeFalsy();
    });
  });

  describe('inspector panel', () => {
    it('should open on click', async () => {
      const nodeName = 'My Node';
      const initialBlocks = [A.blockText().withName(nodeName).build()];

      const { getByText } = await setup({ initialBlocks });
      fireEvent.click(getByText(nodeName));

      expect(getByText('Inspector')).toBeTruthy();
    });

    it('should update a node when title is changed then saved', async () => {
      const nodeName = 'My Node';
      const newInputValue = 'New Title';
      const initialBlocks = [A.blockText().withName(nodeName).build()];
      const updateBlockResponse = A.blockText().withName(newInputValue).build();

      const { getByText, getByLabelText } = await setup({
        initialBlocks,
        updateBlockResponse,
      });

      fireEvent.click(getByText(nodeName));

      fireEvent.change(getByLabelText('Name'), {
        target: { value: newInputValue },
      });

      fireEvent.click(getByText('Save'));
      await waitFor(() => {
        getByText(newInputValue);
      });

      expect(getByText(newInputValue)).toBeTruthy();
    });

    it('should show a form node in the inspector when clicked', async () => {
      const nodeName = 'My Node';
      const initialBlocks = [
        A.blockForm()
          .withName(nodeName)
          .withField('a', FieldType.Dropdown, [
            { label: 'label', id: '22', value: 'test' },
          ])
          .build(),
      ];

      const { getByText } = await setup({ initialBlocks });
      fireEvent.click(getByText(nodeName));

      expect(getByText('Inspector')).toBeTruthy();
    });

    it('should show a api node in the inspector when clicked', async () => {
      const nodeName = 'My Node';
      const initialBlocks = [
        A.blockRest().withName(nodeName).withHeader('a', 'b', 'c').build(),
      ];

      const { getByText } = await setup({ initialBlocks });
      fireEvent.click(getByText(nodeName));

      expect(getByText('Inspector')).toBeTruthy();
    });
  });
});
