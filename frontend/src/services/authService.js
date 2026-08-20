import { API_BASE } from '../utils/constants';

export const checkAuthStatus = async () => {
  const response = await fetch(`${API_BASE}/api/me`, { credentials: 'include', headers: { Accept: 'application/json' } });
  if (!response.ok) return { loggedIn: false };
  return response.json();
};

export const logout = async () => {
  const response = await fetch(`${API_BASE}/logout`, { method: 'POST', credentials: 'include' });
  const data = await response.json();
  if (!response.ok) throw new Error(data.error || 'Logout failed');
  return data;
};

export const buildLoginUrl = (domainType, customDomain = '') => {
  let loginUrl = `${API_BASE}/login?domain=${domainType}`;
  if (domainType === 'custom' && customDomain) {
    loginUrl += `&customDomain=${encodeURIComponent(customDomain.trim())}`;
  }
  return loginUrl;
};

export const validateCustomDomain = (domain) => {
  const value = domain.trim();
  if (!value) return 'Please enter your custom Salesforce domain';
  let url;
  try {
    url = new URL(value.startsWith('http') ? value : `https://${value}`);
  } catch {
    return 'Enter a valid Salesforce My Domain URL';
  }
  if (url.protocol !== 'https:') return 'Custom domain must use https://';
  if (!url.hostname.endsWith('.salesforce.com')) return 'Domain must end with .salesforce.com';
  return null;
};
