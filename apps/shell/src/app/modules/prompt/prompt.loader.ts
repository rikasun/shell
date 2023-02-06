import { Terminal as XTerm } from 'xterm';
import { ansi, escape } from './prompt.ansi';

export const startLoadingMessage = (term: XTerm, message: string) => {
  const cursor = '|/-\\';
  let interval: ReturnType<typeof setTimeout> | undefined;
  const run = (loader = cursor[0]) => {
    term.write(escape('up', 'clear')); // Move cursor up one line and clear it
    term.write(ansi(`${message} ${loader}\n\r`, 'green'));
    const nextLoader = cursor[(cursor.indexOf(loader) + 1) % cursor.length];
    interval = setTimeout(() => run(nextLoader), 100);
  };

  run();

  return () => {
    // istanbul ignore next
    if (interval) {
      clearInterval(interval);
      interval = undefined;
      term.write(ansi('', 'up', 'clear')); // Move cursor up one line and clear it
    }
  };
};
