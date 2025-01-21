import { useSelector } from 'react-redux';
import type { RootState } from '../store/store';

export function useApi() {
  const token = useSelector((state: RootState) => state.auth.token);

  const authenticatedFetch = async (
    url: string,
    options: RequestInit = {}
  ) => {
    if (!token) {
      throw new Error('No authentication token available');
    }

    const headers = {
      ...options.headers,
      Authorization: `Bearer ${token}`,
    };

    const response = await fetch(url, { ...options, headers });
    return response.json();
  };

  return { authenticatedFetch };
}

