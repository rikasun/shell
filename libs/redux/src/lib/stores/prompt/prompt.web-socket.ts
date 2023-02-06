type JSONValue =
  | string
  | number
  | boolean
  | { [x: string]: JSONValue }
  | Array<JSONValue>;

export class PromptWebSocket {
  private websocket?: WebSocket;
  private listenerDisposals: (() => void)[] = [];
  private authenticated = false;
  public connected: Promise<boolean>;

  constructor(url: string) {
    const websocket = new WebSocket(url);
    this.websocket = websocket;

    this.connected = new Promise((resolve) => {
      websocket.onopen = () => resolve(true);
      websocket.onclose = () => resolve(false);
    });
  }

  send(message: string) {
    this._rawSend({ data: message });
  }

  sendResize(cols: number, rows: number) {
    this._rawSend({ resize: [cols, rows] });
  }

  close() {
    // istanbul ignore next
    if (!this.websocket) return;

    this.websocket.close();
    this.websocket.onmessage = null;
    this.listenerDisposals.forEach((dispose) => dispose());
    this.connected = Promise.resolve(false);
    this.websocket = undefined;
  }

  async authenticate(token: string) {
    await this.connected;

    await new Promise<void>((resolve, reject) => {
      // istanbul ignore next
      if (!this.websocket) throw new Error('Web socket closed');

      this.websocket.send(JSON.stringify({ token }));
      this.websocket.onmessage = (event: MessageEvent) => {
        // istanbul ignore next
        if (!this.websocket) return;
        this.websocket.onmessage = null;
        if (event.data === 'authenticated') {
          this.authenticated = true;
          resolve();
        } else {
          this.close();
          reject(new Error('Web Socket failed to authenticated.'));
        }
      };
    });
  }

  onMessage(callback: (data: Uint8Array | string) => void) {
    // istanbul ignore next
    if (!this.websocket) throw new Error('Web socket closed');

    const listener = async (event: MessageEvent) => {
      if (!this.websocket || !this.authenticated) return;

      const buffer = await event.data.arrayBuffer();

      const uint8Array = new Uint8Array(buffer);
      callback(uint8Array);
    };

    this.websocket.addEventListener('message', listener);
    this.listenerDisposals.push(() =>
      this.websocket?.removeEventListener('message', listener),
    );
  }

  onClose(callback: (event?: CloseEvent) => void) {
    // istanbul ignore next
    if (!this.websocket) throw new Error('Web socket closed');

    const listener = (event: CloseEvent) => callback(event);
    this.websocket.addEventListener('close', listener);
    // Don't clean up the listener here, because we want to make sure the 'close' events are fired
  }

  private _rawSend(message: JSONValue) {
    // istanbul ignore next
    if (!this.websocket) {
      throw new Error('Web socket closed');
    } else if (this.websocket.readyState !== WebSocket.OPEN) {
      throw new Error('Web socket not connected');
    } else if (!this.authenticated) {
      throw new Error('Web socket not authenticated');
    }

    this.websocket.send(JSON.stringify(message));
  }
}
