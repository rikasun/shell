import { render, waitFor } from '@testing-library/react';
import { StoreProvider } from 'easy-peasy';
import { BrowserRouter, Route, Routes } from 'react-router-dom';

import { getMockStore, factory } from '@cased/redux';
import PromptWatcher from './prompt-watcher';

describe('Prompt', () => {
  it('renders a prompt watcher', async () => {
    const mockTerminal = {
      open: jest.fn(),
      write: jest.fn(),
      writeln: jest.fn(),
      dispose: jest.fn(),
      onData: jest.fn(),
      loadAddon: jest.fn(),
      onResize: jest.fn(),
    };

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    jest.spyOn(factory, 'createTerminal').mockReturnValue(mockTerminal as any);

    const mockStore = getMockStore({
      promptService: {
        get: async (slug: string) => ({ name: slug } as never),
        getWebSocketUrl: async () => ({
          url: 'ws://localhost:1234',
          promptSessionId: '1234',
        }),
      },
    });

    window.history.pushState({}, '', '/prompts/share/1234-abcd');

    render(
      <StoreProvider store={mockStore}>
        <Routes>
          <Route
            path="/prompts/share/:promptSessionId"
            element={<PromptWatcher />}
          />
        </Routes>
      </StoreProvider>,
      { wrapper: BrowserRouter },
    );

    waitFor(() =>
      expect(mockTerminal.writeln).toHaveBeenCalledWith(
        expect.stringContaining("Welcome to Cased's Prompt!"),
      ),
    );
  });
});
