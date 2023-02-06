import { axiosInstance } from '../axios';

const setToken = (token: string | null) => {
  axiosInstance.defaults.headers.common.token = token;
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const setErrorCallback = (callback: (error: any) => void) => {
  axiosInstance.interceptors.response.use(
    (response) => response,
    (error) => {
      callback(error);
      return Promise.reject(error);
    },
  );
};

export const axiosService = {
  setToken,
  setErrorCallback,
};
