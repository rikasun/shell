import { axiosInstance } from '../axios';
import { axiosService } from './axios-service';

jest.mock('../axios', () => ({
  axiosInstance: {
    defaults: {
      headers: {
        common: {},
      },
    },

    interceptors: {
      response: {
        use: jest.fn(),
      },
    },
  },
}));

describe('axiosService', () => {
  describe('setToken method', () => {
    it('should set the axiosInstance header token', () => {
      axiosService.setToken('token');
      expect(axiosInstance.defaults.headers.common.token).toEqual('token');
    });
  });

  describe('setErrorCallback method', () => {
    it('should set the axiosInstance interceptor', () => {
      const callback = jest.fn();
      axiosService.setErrorCallback(callback);
      expect(axiosInstance.interceptors.response.use).toHaveBeenCalledWith(
        expect.any(Function),
        expect.any(Function),
      );
    });
  });
});
