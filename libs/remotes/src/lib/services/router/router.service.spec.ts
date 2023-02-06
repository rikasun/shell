import { RouterService } from './router.service';

describe('router service', () => {
  describe('setSearchParams', () => {
    it('should not call navigate twice', () => {
      const url = new URL('https://www.example.com?test=test');

      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      delete window.location;
      window.location = url as never;

      const router = {
        navigate: jest.fn(),
        state: { location: url as never },
      };

      const routerService = new RouterService();
      routerService.router = router as never;
      routerService.setSearchParams({ test: 'test' });

      expect(router.navigate).toHaveBeenCalledTimes(0);
    });

    it('should not navigate if no arguments are passed and there is a match', () => {
      const url = new URL('https://www.example.com');

      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      delete window.location;
      window.location = url as never;

      const router = {
        navigate: jest.fn(),
        state: { location: url as never },
      };

      const routerService = new RouterService();
      routerService.router = router as never;
      routerService.setSearchParams({});

      expect(router.navigate).toHaveBeenCalledTimes(0);
    });

    it('should not crash without a router', () => {
      const routerService = new RouterService();
      routerService.setSearchParams({});
    });
  });
});
