// Utility function for making authenticated API requests
export async function authenticatedFetch(
    url: string,
    options: RequestInit = {}
  ) {
    const token = localStorage.getItem('authToken');
    
    if (!token) {
      throw new Error('No authentication token found');
    }
  
    const headers = {
      ...options.headers,
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    };
  
    const response = await fetch(url, {
      ...options,
      headers,
    });
  
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
  
    return response;
  }