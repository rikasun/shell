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

describe('Runbooks - node creation workflows', () => {
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

  const showTheCreateForm = async (
    createButtonId: string,
    nameValue: string,
    createBlockResponse: AllBlocks,
  ) => {
    const screen = setup({ createBlockResponse });
    const { getByText, getByTestId, getByLabelText } = await screen;

    fireEvent.click(getByText('Add Node'));
    fireEvent.click(getByTestId(createButtonId));
    fireEvent.change(getByLabelText('Name'), {
      target: { value: nameValue },
    });

    return screen;
  };

  describe('markdown', () => {
    const createId = 'create-markdown';
    const name = 'my custom name';

    it('should add a markdown node', async () => {
      const createResponse = A.blockText().withName(name).build();

      const { getByText } = await showTheCreateForm(
        createId,
        name,
        createResponse,
      );

      fireEvent.click(getByText('Save'));
      await waitFor(() => {
        getByText(name);
      });

      expect(getByText(name)).toBeTruthy();
    });

    it('should not trigger the cancel logic to close the form if cancel is pressed', async () => {
      const { getByText } = await showTheCreateForm(
        createId,
        name,
        null as never,
      );

      window.confirm = jest.fn(() => false);
      fireEvent.click(getByText('Cancel'));

      expect(getByText('Create A Node')).toBeTruthy();
    });

    it('should show a confirm dialogue when clicking cancel before saving', async () => {
      const createResponse = A.blockText().withName(name).build();

      const { getByText, queryByText } = await showTheCreateForm(
        createId,
        name,
        createResponse,
      );

      window.confirm = jest.fn(() => true);
      fireEvent.click(getByText('Cancel'));

      expect(queryByText('Create A Node')).toBeFalsy();
    });
  });

  it('should add a form node', async () => {
    const createId = 'create-form';
    const name = 'my custom name';
    const createResponse = A.blockForm().withName(name).build();

    const { getByText } = await showTheCreateForm(
      createId,
      name,
      createResponse,
    );
    fireEvent.click(getByText('Save'));
    await waitFor(() => {
      getByText(name);
    });

    expect(getByText(name)).toBeTruthy();
  });

  it('should add a form node with a dropdown filled in', async () => {
    const createId = 'create-form';
    const name = 'my custom name';
    const labelText = 'My custom label';
    const labeTestId = 'form-key-value-creator__label-0';
    const createResponse = A.blockForm()
      .withName(name)
      .withId(2)
      .withField('My custom field', FieldType.Dropdown, [
        { id: '22', label: labelText, value: '24' },
      ])
      .build();

    const { getByText, getByLabelText, getByTestId, queryByText } =
      await showTheCreateForm(createId, name, createResponse);

    // Add a dropdown
    fireEvent.click(getByText('Add a form field'));
    fireEvent.change(getByLabelText('Field Name'), {
      target: { value: 'My custom field' },
    });
    fireEvent.change(getByLabelText('Field Type'), {
      target: { value: 'Dropdown' },
    });
    fireEvent.click(getByText('Add Label'));
    fireEvent.change(getByTestId(labeTestId), {
      target: { value: labelText },
    });

    fireEvent.click(getByText('Save'));
    await waitForElementToBeRemoved(() => queryByText('Save'));
    await waitFor(() => {
      getByText('Form');
    });
  });

  it('should add a rest node', async () => {
    const createId = 'create-rest';
    const name = 'my custom name';
    const selectId = 'form-node-rest__provider-id';
    const selectValue = '1';
    const createResponse = A.blockRest()
      .withName(name)
      .withApiProviderId(selectValue)
      .build();

    const { getByText, getByTestId } = await showTheCreateForm(
      createId,
      name,
      createResponse,
    );

    fireEvent.change(getByTestId(selectId), {
      target: { value: selectValue },
    });
    fireEvent.click(getByText('Save'));
    await waitFor(() => {
      getByText(name);
    });

    expect(getByText(name)).toBeTruthy();
  });

  it('should add a shell node', async () => {
    const createId = 'create-shell';
    const name = 'my custom name';
    const selectId = 'form-node-shell__provider-slug';
    const selectValue = 'demo-bastion-1';
    const createResponse = A.blockShell()
      .withName(name)
      .withPrompts(selectValue)
      .build();

    const { getByText, getByTestId } = await showTheCreateForm(
      createId,
      name,
      createResponse,
    );
    fireEvent.change(getByTestId(selectId), {
      target: { value: selectValue },
    });
    fireEvent.click(getByText('Save'));
    await waitFor(() => {
      getByText(name);
    });

    expect(getByText(name)).toBeTruthy();
  });

  it('should add a database node', async () => {
    const createId = 'create-database';
    const name = 'my custom name';
    const selectId = 'form-node-database__database-id';
    const selectValue = '1';
    const createResponse = A.blockDatabase()
      .withName(name)
      .withDatabaseId(selectValue)
      .build();

    const { getByText, getByTestId } = await showTheCreateForm(
      createId,
      name,
      createResponse,
    );
    fireEvent.change(getByTestId(selectId), {
      target: { value: selectValue },
    });
    fireEvent.click(getByText('Save'));
    await waitFor(() => {
      getByText(name);
    });

    expect(getByText(name)).toBeTruthy();
  });
});
