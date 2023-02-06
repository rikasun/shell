import { promptService as PromptType, PromptAccessError } from '@cased/remotes';
import { render, waitFor } from '@testing-library/react';
import { StoreProvider } from 'easy-peasy';
import { BrowserRouter, Route, Routes } from 'react-router-dom';
import { WebSocketStatus, getMockStore, factory } from '@cased/redux';

import Prompt from './prompt';

const fakeToken =
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyfQ.SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c';

const prepareTest = (injections = {}) => {
  const messageSubscriptions: ((_: unknown) => void)[] = [];

  const mockWebSocket = {
    send: jest.fn(),
    sendResize: jest.fn(),
    close: jest.fn(),
    authenticate: jest.fn(),
    onMessage: jest
      .fn()
      .mockImplementation((callback) => messageSubscriptions.push(callback)),
    onClose: jest.fn(),
  };

  const mockTerminal = {
    open: jest.fn(),
    write: jest.fn(),
    dispose: jest.fn(),
    onData: jest.fn(),
    loadAddon: jest.fn(),
    onResize: jest.fn(),
  };

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  jest.spyOn(factory, 'createWebSocket').mockReturnValue(mockWebSocket as any);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  jest.spyOn(factory, 'createTerminal').mockReturnValue(mockTerminal as any);

  const mockStore = getMockStore({
    promptService: {
      get: async (slug: string) => ({ name: slug } as PromptType),
      getWebSocketUrl: async () => ({
        url: 'ws://localhost:1234',
        promptSessionId: '1234',
      }),
    },
    ...injections,
  });

  mockStore.getActions().auth.setAccessToken({ token: fakeToken });

  window.history.pushState({}, '', '/prompts/my-prompt');

  const sendMessageFromServer = (message: string) => {
    messageSubscriptions.forEach((callback) => callback(message));
  };

  const expectTerminalOutput = (expected: string) =>
    waitFor(() =>
      expect(mockTerminal.write).toHaveBeenCalledWith(
        expect.stringContaining(expected),
      ),
    );

  const expectWebSocketStatus = async (status: WebSocketStatus) =>
    waitFor(() => expect(mockStore.getState().prompt.status).toBe(status));

  return {
    mockStore,
    mockWebSocket,
    expectWebSocketStatus,
    expectTerminalOutput,
    sendMessageFromServer,
  };
};

describe('Prompt', () => {
  it('renders a terminal', async () => {
    const {
      sendMessageFromServer,
      mockWebSocket,
      expectWebSocketStatus,
      expectTerminalOutput,
      mockStore,
    } = prepareTest();

    render(
      <StoreProvider store={mockStore}>
        <Routes>
          <Route path="/prompts/:slug" element={<Prompt slug="my-prompt" />} />
        </Routes>
      </StoreProvider>,
      { wrapper: BrowserRouter },
    );

    await waitFor(() =>
      expect(mockWebSocket.authenticate).toHaveBeenCalledWith(fakeToken),
    );

    sendMessageFromServer('$A_PROMPT>');
    await expectTerminalOutput('$A_PROMPT>');
    await expectWebSocketStatus(WebSocketStatus.Connected);
  });

  it('displays error when authentication fails', async () => {
    const {
      mockWebSocket,
      mockStore,
      expectTerminalOutput,
      expectWebSocketStatus,
    } = prepareTest();

    mockWebSocket.authenticate.mockRejectedValue(new Error());

    render(
      <StoreProvider store={mockStore}>
        <Routes>
          <Route path="/prompts/:slug" element={<Prompt slug="my-prompt" />} />
        </Routes>
      </StoreProvider>,
      { wrapper: BrowserRouter },
    );

    await expectTerminalOutput('Failed to connect to my-prompt');
    await waitFor(() =>
      expect(mockWebSocket.authenticate).toHaveBeenCalledWith(fakeToken),
    );

    await expectWebSocketStatus(WebSocketStatus.Disconnected);
  });

  it(`Fails to run if the user doesn't have access`, async () => {
    const { expectTerminalOutput, mockStore } = prepareTest({
      promptService: {
        get: async (slug: string) => ({ name: slug } as PromptType),
        getWebSocketUrl: (slug: string) => {
          throw new PromptAccessError({ slug } as PromptType);
        },
      },
    });

    render(
      <StoreProvider store={mockStore}>
        <Routes>
          <Route path="/prompts/:slug" element={<Prompt slug="my-prompt" />} />
        </Routes>
      </StoreProvider>,
      { wrapper: BrowserRouter },
    );

    await expectTerminalOutput(`You don't have access to my-prompt`);
  });

  it('Fails to run two connections at once', async () => {
    const { mockStore, mockWebSocket, expectTerminalOutput } = prepareTest();

    render(
      <StoreProvider store={mockStore}>
        <Routes>
          <Route path="/prompts/:slug" element={<Prompt slug="my-prompt" />} />
        </Routes>
      </StoreProvider>,
      { wrapper: BrowserRouter },
    );

    await waitFor(() =>
      expect(mockWebSocket.authenticate).toHaveBeenCalledWith(fakeToken),
    );

    render(
      <StoreProvider store={mockStore}>
        <Routes>
          <Route path="/prompts/:slug" element={<Prompt slug="my-prompt" />} />
        </Routes>
      </StoreProvider>,
      { wrapper: BrowserRouter },
    );

    await expectTerminalOutput('Failed to connect to my-prompt');
  });

  it('Fails to run if the url lookup fails', async () => {
    const { expectTerminalOutput, mockStore } = prepareTest({
      promptService: {
        get: async (slug: string) => ({ name: slug } as PromptType),
        getWebSocketUrl: () => {
          throw new Error("Can't find prompt");
        },
      },
    });

    render(
      <StoreProvider store={mockStore}>
        <Routes>
          <Route path="/prompts/:slug" element={<Prompt slug="my-prompt" />} />
        </Routes>
      </StoreProvider>,
      { wrapper: BrowserRouter },
    );

    await expectTerminalOutput(`Failed to connect to my-prompt`);
  });
});
