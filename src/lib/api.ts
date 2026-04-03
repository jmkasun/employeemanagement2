export const fetchWithAuth = async (url: string, options: RequestInit = {}) => {
  const user = JSON.parse(localStorage.getItem('ems_user') || '{}');
  
  const headers = {
    ...options.headers,
    'x-user-id': user.id?.toString() || '',
    'x-account-id': user.account_id?.toString() || '',
    'x-user-role': user.role || ''
  };

  const response = await fetch(url, { ...options, headers });
  
  if (response.status === 401) {
    localStorage.removeItem('ems_user');
    window.location.href = '/';
    throw new Error('Unauthorized');
  }

  return response;
};
