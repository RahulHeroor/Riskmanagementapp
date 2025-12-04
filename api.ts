import { Risk, User, AuthResponse } from './types';

const API_BASE = `http://${window.location.hostname}:3001/api`;

let authToken: string | null = localStorage.getItem('token');

const getHeaders = () => {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };
  if (authToken) {
    headers['Authorization'] = `Bearer ${authToken}`;
  }
  return headers;
};

export const api = {
  setToken: (token: string | null) => {
    authToken = token;
    if (token) localStorage.setItem('token', token);
    else localStorage.removeItem('token');
  },

  login: async (username: string, password: string): Promise<AuthResponse> => {
    const response = await fetch(`${API_BASE}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password }),
    });
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Login failed');
    }
    return response.json();
  },

  register: async (username: string, password: string, role: string): Promise<AuthResponse> => {
    const response = await fetch(`${API_BASE}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password, role }),
    });
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Registration failed');
    }
    return response.json();
  },

  getRisks: async (): Promise<Risk[]> => {
    const response = await fetch(`${API_BASE}/risks`, { headers: getHeaders() });
    if (!response.ok) {
      if (response.status === 401 || response.status === 403) throw new Error('Unauthorized');
      throw new Error('Failed to fetch risks');
    }
    return response.json();
  },

  createRisk: async (risk: Risk): Promise<Risk> => {
    const response = await fetch(`${API_BASE}/risks`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(risk),
    });
    if (!response.ok) throw new Error('Failed to create risk');
    return response.json();
  },

  updateRisk: async (risk: Risk): Promise<Risk> => {
    const response = await fetch(`${API_BASE}/risks/${risk.id}`, {
      method: 'PUT',
      headers: getHeaders(),
      body: JSON.stringify(risk),
    });
    if (!response.ok) throw new Error('Failed to update risk');
    return response.json();
  },

  deleteRisk: async (id: string): Promise<void> => {
    const response = await fetch(`${API_BASE}/risks/${id}`, {
      method: 'DELETE',
      headers: getHeaders(),
    });
    if (!response.ok) throw new Error('Failed to delete risk');
  }
};