/**
 * API base URL (includes `/api` path segment).
 * - If VITE_API_BASE_URL is set → always use it (local or remote).
 * - Else in dev (npm run dev) → localhost so your PC backend works.
 * - Else in production build → Render default.
 */
const PROD_DEFAULT = 'https://rubbereco-backend.onrender.com/api';
const DEV_DEFAULT = 'http://localhost:5000/api';

export function getApiBaseUrl() {
  const explicit = import.meta.env.VITE_API_BASE_URL;
  if (explicit != null && String(explicit).trim() !== '') {
    return String(explicit).replace(/\/$/, '');
  }
  return import.meta.env.DEV ? DEV_DEFAULT : PROD_DEFAULT;
}
