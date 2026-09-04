const TOKEN_KEY = 'ep_token';
const USER_KEY = 'ep_user';

// NOTE: Using in-memory module state instead of localStorage would be lost on refresh;
// for this demo we use localStorage on the client only (never store the Zoho token here).
export function saveSession(token, user) {
  localStorage.setItem(TOKEN_KEY, token);
  localStorage.setItem(USER_KEY, JSON.stringify(user));
}

export function getToken() {
  return localStorage.getItem(TOKEN_KEY);
}

export function getUser() {
  const raw = localStorage.getItem(USER_KEY);
  return raw ? JSON.parse(raw) : null;
}

export function clearSession() {
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(USER_KEY);
}
