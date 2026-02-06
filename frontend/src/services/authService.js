import { API_BASE } from '../utils/constants';

export const checkAuthStatus = async () => {
  const response = await fetch(`${API_BASE}/api/me`, {
    credentials: 'include',
    headers: {
      'Accept': 'application/json',
      'Content-Type': 'application/json'
    },
  });
  
  if (!response.ok) {
    return { loggedIn: false };
  }
  
  return response.json();
};

export const logout = async () => {
  const response = await fetch(`${API_BASE}/logout`, {
    method: 'POST',
    credentials: 'include',
  });
  
  const data = await response.json();
  
  if (!response.ok) {
    throw new Error(data.error || 'Logout failed');
  }
  
  return data;
};

export const buildLoginUrl = (domainType, customDomain = '') => {
  let loginUrl = `${API_BASE}/login?domain=${domainType}`;
  if (domainType === 'custom' && customDomain) {
    loginUrl += `&customDomain=${encodeURIComponent(customDomain)}`;
  }
  return loginUrl;
};

export const validateCustomDomain = (domain) => {
  if (!domain) {
    return 'Please enter your custom Salesforce domain';
  }
  if (!domain.startsWith('https://')) {
    return 'Custom domain must start with https://';
  }
  if (!domain.includes('.salesforce.com')) {
    return 'Domain must be a valid Salesforce URL (e.g., https://yourdomain.my.salesforce.com)';
  }
  return null;
};
