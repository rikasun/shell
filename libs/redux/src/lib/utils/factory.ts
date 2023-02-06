import { Terminal } from 'xterm';
import { PromptWebSocket } from '../stores/prompt/prompt.web-socket';

export const factory = {
  createWebSocket: (url: string) => new PromptWebSocket(url),
  createTerminal: () => new Terminal(),
};
