const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || 'http://localhost:3001';

export interface AuthResponse {
  token: string;
  user: {
    address: string;
    nonce: string;
  };
}

export const authApi = {
  getNonce: async (address: string): Promise<string> => {
    const response = await fetch(`${API_BASE_URL}/auth/nonce?address=${address}`);
    const data = await response.json();
    return data.nonce;
  },

  login: async (address: string, signature: string): Promise<AuthResponse> => {
    const response = await fetch(`${API_BASE_URL}/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ address, signature }),
    });
    return response.json();
  },
};

