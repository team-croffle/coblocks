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

/**
 * 로그인·가입·복구는 401 이 "자격 증명이 틀렸다"는 정상 응답이다.
 * 세션 만료로 취급해 로그인으로 튕기면 화면이 오류를 보여줄 새가 없다.
 */
/**
 * 401 은 "이 토큰으로는 안 된다"이고, 네트워크 오류는 "지금 물어볼 수 없다"이다.
 * 둘을 같이 다루면 API 가 잠깐 죽었을 때 멀쩡한 세션을 지우게 된다.
 */
export const isUnauthorized = (error: unknown): boolean =>
  axios.isAxiosError(error) && error.response?.status === 401;

const AUTH_ATTEMPT_PATHS = ['/auth/login', '/auth/signup', '/auth/recover'];
const isAuthAttempt = (url: string | undefined): boolean =>
  !!url && AUTH_ATTEMPT_PATHS.some((path) => url.startsWith(path));

http.interceptors.response.use(
  (res) => res,
  // axios 인터셉터는 콜백 등록이 유일한 API 다. async/await 로 바꿀 수 있는 자리가 아니다.
  // oxlint-disable-next-line promise/prefer-await-to-callbacks
  (error) => {
    // 401 이면 세션이 끊긴 것으로 보고 로그인으로 되돌린다.
    // 단, 인증을 시도한 요청 자체의 401 은 화면이 직접 처리한다.
    if (
      error?.response?.status === 401 &&
      !isAuthAttempt(error?.config?.url) &&
      !location.pathname.startsWith('/login')
    ) {
      localStorage.removeItem('coblocks.token');
      location.assign(`/login?redirect=${encodeURIComponent(location.pathname)}`);
    }
    return Promise.reject(error);
  },
);
