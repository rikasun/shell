import { Debounce } from './debounce';

describe('debounce', () => {
  describe('run method', () => {
    it('should call the function after the delay', () => {
      const fn = jest.fn();

      jest.useFakeTimers();
      const debounce = new Debounce(100);
      debounce.run(fn);
      jest.advanceTimersByTime(100);

      expect(fn).toHaveBeenCalled();
    });

    it('should not call the function immediately', () => {
      const fn = jest.fn();

      jest.useFakeTimers();
      const debounce = new Debounce(100);
      debounce.run(fn);

      expect(fn).not.toHaveBeenCalled();
    });
  });
});
