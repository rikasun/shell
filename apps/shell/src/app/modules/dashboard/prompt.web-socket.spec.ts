import { waitFor } from '@testing-library/react';
import { Blob } from 'buffer';
import { WS } from 'jest-websocket-mock';
import { TextDecoder } from 'util';
import { PromptWebSocket } from '@cased/redux';

const url = 'ws://localhost:1234';
let server: WS;

const connect = async () => {
  const webSocket = new PromptWebSocket(url);
  await server.connected;
  webSocket.authenticate('token');

  const message = await server.nextMessage;
  expect(message).toBe(JSON.stringify({ token: 'token' }));

  server.send('authenticated');
  await waitFor(() => {
    expect(webSocket).toHaveProperty('authenticated', true);
  });

  return webSocket;
};

/**
 * @TODO Temporarily placed here until this can be rewritten with an integration test
 */
describe('PromptWebSocket', () => {
  beforeEach(() => {
    server = new WS(url);
  });

  afterEach(() => {
    WS.clean();
  });

  it('authenticates', async () => {
    const webSocket = await connect();
    await waitFor(() => {
      expect(webSocket).toHaveProperty('authenticated', true);
    });
  });

  it('fails to authenticate', async () => {
    const webSocket = new PromptWebSocket(url);
    await server.connected;

    let caughtError: Error;
    webSocket.authenticate('token').catch((error: Error) => {
      caughtError = error;
    });

    const message = await server.nextMessage;
    expect(message).toBe(JSON.stringify({ token: 'token' }));

    server.send('not authenticated');
    await waitFor(() => {
      expect(caughtError).toBeInstanceOf(Error);
      expect(caughtError.message).toBe('Web Socket failed to authenticated.');
    });
  });

  it('can send a message', async () => {
    const webSocket = await connect();
    webSocket.send('hello');
    const message = await server.nextMessage;
    expect(message).toBe(JSON.stringify({ data: 'hello' }));
  });

  it('can send a resize message', async () => {
    const webSocket = await connect();
    webSocket.sendResize(80, 24);
    const message = await server.nextMessage;
    expect(message).toBe(JSON.stringify({ resize: [80, 24] }));
  });

  it('raises an error when sending a message before connected', async () => {
    const webSocket = new PromptWebSocket(url);
    expect(() => webSocket.send('hello')).toThrowError(
      'Web socket not connected',
    );
  });

  it('raises an error if sending a message before authenticated', async () => {
    const webSocket = new PromptWebSocket(url);
    await server.connected;
    expect(() => webSocket.send('hello')).toThrowError(
      'Web socket not authenticated',
    );
  });

  it('receives messages', async () => {
    const webSocket = await connect();
    let message: string;
    webSocket.onMessage((data) => {
      if (typeof data === 'string')
        throw new Error('Expected data to be of type string');
      message = new TextDecoder().decode(data);
    });
    server.send(new Blob(['hello']));

    await waitFor(() => {
      expect(message).toBe('hello');
    });
  });

  it('receives close messages', async () => {
    const webSocket = new PromptWebSocket(url);
    await server.connected;
    let isClosed = false;
    webSocket.onClose(() => {
      isClosed = true;
    });
    server.close();

    waitFor(() => {
      expect(isClosed).toBeTruthy();
    });
  });
});
