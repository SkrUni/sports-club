// Утилита для API запросов с авторизацией
export const apiRequest = async (url: string, options: RequestInit = {}) => {
  const authToken = localStorage.getItem('auth-token');
  const headers = new Headers(options.headers || {});
  if (!headers.has('Content-Type')) {
    headers.set('Content-Type', 'application/json');
  }
  
  if (authToken) {
    headers.set('Authorization', `Bearer ${authToken}`);
  }
  
  return fetch(url, {
    ...options,
    headers,
  });
};

// Утилита для получения данных с авторизацией
export const fetchWithAuth = async (url: string, options: RequestInit = {}) => {
  try {
    const response = await apiRequest(url, options);
    
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ error: 'Ошибка сервера' }));
      throw new Error(errorData.error || `HTTP ${response.status}`);
    }
    
    return await response.json();
  } catch (error) {
    console.error('API Error:', error);
    throw error;
  }
};

