import { Router as RemixRouter } from '@remix-run/router';

export class RouterService {
  router?: RemixRouter;

  navigate(url: string): void {
    this.router?.navigate(url);
  }

  setSearchParams(paramsByKey: Record<string, string>): void {
    if (!this.router) return;
    const url = `${window.location.pathname}${window.location.search}`;

    const params = new URLSearchParams(paramsByKey);
    let newLocation = `${this.router.state.location.pathname}?${params}`;
    if (newLocation.endsWith('?')) {
      newLocation = newLocation.slice(0, -1);
    }

    // React strict mode calls this twice annoyingly, make sure we don't navigate twice
    if (url === newLocation) return;

    this.router.navigate(newLocation);
  }
}

export const routerService = new RouterService();
