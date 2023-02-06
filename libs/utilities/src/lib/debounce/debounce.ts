/**
 * A re-usable debounce utility. Allows overwriting run calls before the delay expires
 */
export class Debounce {
  private timeout?: number;

  /**
   * @param delay The time in milliseconds before the function is executed
   */
  constructor(private delay: number) {}

  public run(fn: () => void) {
    if (this.timeout) {
      window.clearTimeout(this.timeout);
    }

    this.timeout = window.setTimeout(fn, this.delay);
  }
}
