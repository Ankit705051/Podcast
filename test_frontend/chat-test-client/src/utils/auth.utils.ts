const TOKEN_KEY = 'accessToken';

export const setToken = (token: string) => {
  localStorage.setItem(TOKEN_KEY, token);
};

export const getToken = () => {
  return localStorage.getItem(TOKEN_KEY);
};

export const removeToken = () => {
  localStorage.removeItem(TOKEN_KEY);
};
export const isAuthenticated = () => {
  return !!localStorage.getItem(TOKEN_KEY);
};
