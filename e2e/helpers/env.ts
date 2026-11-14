// Where the system under test runs. Override with environment variables.
export const BASE_URL = stripSlash(process.env.BASE_URL || 'http://localhost:5173');
export const API_URL = stripSlash(process.env.API_URL || 'http://localhost:3000/api');
export const MAILPIT_URL = stripSlash(process.env.MAILPIT_URL || 'http://localhost:8025');

/** Full backend URL for an API path such as "/auth/login". */
export function apiUrl(path: string): string {
  return `${API_URL}${path}`;
}

function stripSlash(url: string): string {
  return url.replace(/\/+$/, '');
}
