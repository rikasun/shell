import { authService } from './auth-service';
import { axiosInstance } from '../axios';

describe('authService', () => {
  describe('login', () => {
    it('should login', async () => {
      const email = 'asdf@google.com';

      const data = {
        access_token: 'a',
        refresh_token: 'b',
      };

      const response = Promise.resolve({ data });

      jest.spyOn(axiosInstance, 'post').mockResolvedValueOnce(response);

      const user = await authService.login(email);

      expect(user).toEqual({
        accessToken: data.access_token,
        refreshToken: data.refresh_token,
      });
    });
  });

  describe('login refresh', () => {
    it('should return the renewed access token', async () => {
      const email = 'asdf@google.com';
      const refreshToken = 'b';

      const data = {
        access_token: 'a',
      };

      const response = Promise.resolve({ data });

      jest.spyOn(axiosInstance, 'post').mockResolvedValueOnce(response);

      const accessToken = await authService.loginRefresh(refreshToken, email);

      expect(accessToken).toEqual(data.access_token);
    });

    it('should pass the expected arguments to axios post', async () => {
      const email = 'asdf@google.com';
      const refreshToken = 'b';

      const data = {
        access_token: 'a',
      };

      const response = Promise.resolve({ data });

      const spy = jest
        .spyOn(axiosInstance, 'post')
        .mockResolvedValueOnce(response);

      await authService.loginRefresh(refreshToken, email);

      expect(spy).toHaveBeenCalledWith('/v2/developer/refresh', null, {
        params: { refresh_token: refreshToken, email },
      });
    });
  });
});
