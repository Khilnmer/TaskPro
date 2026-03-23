export const tokenKey = 'taskpro_access_token';

export function getAccessToken(): string | null {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem(tokenKey);
}

export function setAccessToken(token: string) {
  localStorage.setItem(tokenKey, token);
}

export function clearAccessToken() {
  localStorage.removeItem(tokenKey);
}
