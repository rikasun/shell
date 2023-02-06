import { render, waitFor } from '@testing-library/react';
import { StoreProvider } from 'easy-peasy';
import { BrowserRouter, Route, Routes } from 'react-router-dom';
import { getMockStore } from '@cased/redux';
import { A } from '@cased/test-utilities';

import PromptConnect from './prompt-connect';

describe('Prompt Connect', () => {
  interface IOptions {
    get: jest.Mock;
  }

  const setup = async (options: IOptions) => {
    const { get } = options;

    const promptService = { get };

    Object.defineProperty(window, 'matchMedia', {
      writable: true,
      value: jest.fn().mockImplementation((query) => ({
        matches: false,
        media: query,
        onchange: null,
        addListener: jest.fn(), // Deprecated
        removeListener: jest.fn(), // Deprecated
        addEventListener: jest.fn(),
        removeEventListener: jest.fn(),
        dispatchEvent: jest.fn(),
      })),
    });

    global.console = { ...global.console, error: jest.fn() };

    window.history.pushState({}, '', `/prompts/demo-bastion`);
    const result = render(
      <StoreProvider store={getMockStore({ promptService })}>
        <Routes>
          <Route path="/prompts/:slug" element={<PromptConnect />} />
        </Routes>
      </StoreProvider>,
      {
        wrapper: BrowserRouter,
      },
    );

    await waitFor(() => result.getByTestId('prompt-connect-ready'));

    return result;
  };

  it('should render', async () => {
    const { getByTestId } = await setup({
      get: jest.fn().mockReturnValue(Promise.resolve(A.promptForm().build())),
    });
    await waitFor(() =>
      expect(getByTestId('prompt-connect-ready')).toBeTruthy(),
    );
  });

  it('should render a <PromptForm /> successfully when more info is needed', async () => {
    const { getByTestId } = await setup({
      get: jest
        .fn()
        .mockReturnValue(
          Promise.resolve(A.promptForm().withNeedsMoreInfo(true).build()),
        ),
    });

    await waitFor(() => expect(getByTestId('prompt-form')).toBeTruthy());
  });

  it('should render a <Prompt /> successfully when no more info is needed', async () => {
    const { getByTestId } = await setup({
      get: jest.fn().mockReturnValue(Promise.resolve(A.promptForm().build())),
    });

    expect(getByTestId('prompt-terminal')).toBeTruthy();
  });

  it('should not render <Prompt/> when more info is needed', async () => {
    const { queryByTestId } = await setup({
      get: jest
        .fn()
        .mockReturnValue(
          Promise.resolve(A.promptForm().withNeedsMoreInfo(true).build()),
        ),
    });

    expect(queryByTestId('prompt-terminal')).toBeNull();
  });

  it('should not render <PromptForm/> when no more info is needed', async () => {
    const { queryByTestId } = await setup({
      get: jest.fn().mockReturnValue(Promise.resolve(A.promptForm().build())),
    });

    expect(queryByTestId('prompt-form')).toBeNull();
  });
});
