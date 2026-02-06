import { API_BASE } from '../utils/constants';

const handleResponse = async (response) => {
  const data = await response.json();
  
  if (!response.ok) {
    if (response.status === 401 || data.code === 'INVALID_SESSION_ID') {
      throw new Error('SESSION_EXPIRED');
    }
    throw new Error(data.error || 'Request failed');
  }
  
  return data;
};

export const fetchRules = async () => {
  const response = await fetch(`${API_BASE}/api/validation-rules`, {
    credentials: 'include',
  });
  return handleResponse(response);
};

export const toggleRule = async (ruleId, active) => {
  const url = `${API_BASE}/api/validation-toggle?id=${encodeURIComponent(ruleId)}&active=${active}`;
  const response = await fetch(url, {
    method: 'POST',
    credentials: 'include',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ Id: ruleId, Active: active }),
  });
  return handleResponse(response);
};
