import { TOKEN_ACCESS_ID, TOKEN_REFERSH_ID } from '@cased/remotes';
import { getMockStore } from '@cased/redux';

/**
 * @TODO Tests for the auth store have been placed here temporarily. They should be
 * rewritten into the auth guard as integration tests instead
 */
describe('auth store', () => {
  interface IOptions {
    refreshToken?: Promise<string>;
    loginToken?: Promise<{ accessToken: string }>;
    storageKeyValuPairs?: Record<string, string>;
  }

  const setup = (options: IOptions = {}) => {
    const defaults = { storageKeyValuPairs: {} };
    const { refreshToken, loginToken, storageKeyValuPairs } = {
      ...defaults,
      ...options,
    };

    global.console = { warn: jest.fn() } as never;

    const services = {
      authService: {
        login: jest.fn().mockReturnValue(loginToken),
        loginRefresh: jest.fn().mockReturnValue(refreshToken),
        setToken: jest.fn().mockReturnValue(null),
      },
      storageService: {
        get: jest
          .fn()
          .mockImplementation((key) => storageKeyValuPairs[key] || null),
        set: jest.fn(),
        remove: jest.fn(),
      },
      axiosService: {
        setToken: jest.fn(),
      },
    };

    const store = getMockStore(services);

    return {
      store,
      storageService: services.storageService,
    };
  };

  describe('writeAccessToken method', () => {
    it('should set the access token', () => {
      const token = 'token';
      const { store, storageService } = setup();

      store.getActions().auth.writeAccessToken({
        token,
      });

      expect(storageService.set).toHaveBeenCalledWith(TOKEN_ACCESS_ID, token);
    });

    it('should remove the access token if null is returned', () => {
      const { store, storageService } = setup();

      store.getActions().auth.writeAccessToken({
        token: null as never,
      });

      expect(storageService.remove).toHaveBeenCalledWith(TOKEN_ACCESS_ID);
    });
  });

  describe('restore method', () => {
    it('should set the access token', async () => {
      const initAccessToken =
        'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJlbWFpbCI6IjEyMzQ1Njc4OTAifQ.251r1MJVzlH6o1lpxUg_MLhULBFPkn95zyhVCgl1Ghs';
      const refreshTokenValue =
        'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJlbWFpbCI6IjEyMzQ1Njc4OTBAZ21haWwuY29tIn0.FBAGa_AWMvxz99jzwQewRCh2Bd_iXPBD3vALpnLVP2M';
      const refreshToken = Promise.resolve(refreshTokenValue);
      const storageKeyValuPairs = {
        [TOKEN_ACCESS_ID]: initAccessToken,
        [TOKEN_REFERSH_ID]: initAccessToken,
      };

      const { store } = setup({
        refreshToken,
        storageKeyValuPairs,
      });

      await store.getActions().auth.restore();

      expect(store.getState().auth.accessToken).toEqual(refreshTokenValue);
    });

    it('should set restore complete if there is no access token', async () => {
      const { store } = setup();

      await store.getActions().auth.restore();

      expect(store.getState().auth.restoreComplete).toEqual(true);
    });

    it('should set restore complete if there is no restore token', async () => {
      const initAccessToken =
        'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJlbWFpbCI6IjEyMzQ1Njc4OTBAZ21haWwuY29tIn0.FBAGa_AWMvxz99jzwQewRCh2Bd_iXPBD3vALpnLVP2M';
      const storageKeyValuPairs = { [TOKEN_ACCESS_ID]: initAccessToken };

      const { store } = setup({ storageKeyValuPairs });
      await store.getActions().auth.restore();

      expect(store.getState().auth.restoreComplete).toEqual(true);
    });
  });

  describe('login method', () => {
    it('should set an access token from the login response', async () => {
      const accessToken =
        'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJlbWFpbCI6IjEyMzQ1Njc4OTBAZ21haWwuY29tIn0.FBAGa_AWMvxz99jzwQewRCh2Bd_iXPBD3vALpnLVP2M';
      const loginToken = Promise.resolve({ accessToken });

      const { store } = setup({ loginToken });
      await store.getActions().auth.login({ email: '' });

      expect(store.getState().auth.accessToken).toBe(accessToken);
    });

    it('should catch an error', async () => {
      const errorMessage = 'Login failed. Please try again';
      const loginToken = Promise.reject();
      const { store } = setup({ loginToken });

      await store.getActions().auth.login({ email: '' });

      expect(store.getState().notifications.messages[0].message).toBe(
        errorMessage,
      );
    });
  });

  describe('setAccessToken method', () => {
    it('should set the accessToken', () => {
      const token = 'token';

      const { store } = setup();
      store.getActions().auth.setAccessToken({ token });

      expect(store.getState().auth.accessToken).toEqual(token);
    });

    it('should set the storage service access_token with the token', () => {
      const token = 'token';

      const { store, storageService } = setup();
      store.getActions().auth.writeAccessToken({ token });

      expect(storageService.set).toHaveBeenCalledWith('access_token', token);
    });

    it('should delete the storage service key for the token', () => {
      const token = '';

      const { store, storageService } = setup();
      store.getActions().auth.writeAccessToken({ token });

      expect(storageService.remove).toHaveBeenCalled();
    });
  });

  describe('setRefreshToken', () => {
    it('should set the refreshToken', () => {
      const token = 'token';

      const { store } = setup();
      store.getActions().auth.setRefreshToken({ refresh: token });

      expect(store.getState().auth.refreshToken).toEqual(token);
    });

    it('should set the local storage key with the token', () => {
      const token = 'token';

      const { store, storageService } = setup();
      store.getActions().auth.writeRefreshToken({ refresh: token });

      expect(storageService.set).toHaveBeenCalledWith('refreshToken', token);
    });

    it('should delete the local storage key for the token', () => {
      const token = '';

      const { store, storageService } = setup();
      store.getActions().auth.writeRefreshToken({ refresh: token });

      expect(storageService.remove).toHaveBeenCalledWith('refreshToken');
    });
  });
});
