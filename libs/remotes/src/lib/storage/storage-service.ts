export const TOKEN_ID = 'token';
export const TOKEN_ACCESS_ID = 'access_token';
export const TOKEN_REFERSH_ID = 'refreshToken';

const getCookie = (name: string): string | undefined => {
  const r = document.cookie.match(`\\b${name}=([^;]*)\\b`);
  return r ? r[1] : undefined;
};

const setCookie = (name: string, value: string) => {
  const DAYS = 90;
  const date = new Date();
  date.setTime(date.getTime() + DAYS * 24 * 60 * 60 * 1000);
  const expires = `; expires=${date.toUTCString()}`;

  document.cookie = `${name}=${value}${expires}; path=/`;
};

const removeCookie = (name: string) => {
  setCookie(name, '');
};

const clear = () => {
  removeCookie(TOKEN_ID);
  removeCookie(TOKEN_ACCESS_ID);
  removeCookie(TOKEN_REFERSH_ID);
};

export const storageService = {
  get: getCookie,
  set: setCookie,
  remove: removeCookie,
  clear,
};
