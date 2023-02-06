import { axiosInstance } from '../axios';

const login = async (email: string) => {
  const {
    // eslint-disable-next-line @typescript-eslint/naming-convention
    data: { access_token, refresh_token },
  } = await axiosInstance.post<{
    access_token: string;
    refresh_token: string;
  }>('/v2/developer/jwt', null, {
    params: { email },
  });

  return {
    accessToken: access_token,
    refreshToken: refresh_token,
  };
};

const loginRefresh = async (refreshToken: string, email: string) => {
  const {
    // eslint-disable-next-line @typescript-eslint/naming-convention
    data: { access_token },
  } = await axiosInstance.post<{
    access_token: string;
  }>('/v2/developer/refresh', null, {
    params: { refresh_token: refreshToken, email },
  });

  return access_token;
};

const loginOpenSource = async (email: string, password: string) => {
  const {
    data: { accessToken, refreshToken },
  } = await axiosInstance.post<{
    accessToken: string;
    refreshToken: string;
  }>('/api/jwt', { email, password });

  return {
    accessToken,
    refreshToken,
  };
};

export const authService = {
  login,
  loginRefresh,
  loginOpenSource,
};
