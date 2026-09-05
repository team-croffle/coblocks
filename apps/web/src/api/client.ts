import axios from 'axios';

export const http = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL ?? '/api',
  timeout: 10_000,
});

http.interceptors.request.use((config) => {
  const token = localStorage.getItem('coblocks.token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

http.interceptors.response.use(
  (res) => res,
  // axios 인터셉터는 콜백 등록이 유일한 API 다. async/await 로 바꿀 수 있는 자리가 아니다.
  // oxlint-disable-next-line promise/prefer-await-to-callbacks
  (error) => {
    // 401 이면 세션이 끊긴 것으로 보고 로그인으로 되돌린다.
    if (error?.response?.status === 401 && !location.pathname.startsWith('/login')) {
      localStorage.removeItem('coblocks.token');
      location.assign(`/login?redirect=${encodeURIComponent(location.pathname)}`);
    }
    return Promise.reject(error);
  },
);
