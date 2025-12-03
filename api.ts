import { Risk } from './types';

// Dynamically determine the backend URL based on how the frontend is accessed.
// If accessed via 192.168.1.12, it will connect to 192.168.1.12:3001.
const API_BASE = `http://${window.location.hostname}:3001/api`;

export const api = {
  getRisks: async (): Promise<Risk[]> => {
    const response = await fetch(`${API_BASE}/risks`);
    if (!response.ok) throw new Error('Failed to fetch risks');
    return response.json();
  },

  createRisk: async (risk: Risk): Promise<Risk> => {
    const response = await fetch(`${API_BASE}/risks`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(risk),
    });
    if (!response.ok) throw new Error('Failed to create risk');
    return response.json();
  },

  updateRisk: async (risk: Risk): Promise<Risk> => {
    const response = await fetch(`${API_BASE}/risks/${risk.id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(risk),
    });
    if (!response.ok) throw new Error('Failed to update risk');
    return response.json();
  },

  deleteRisk: async (id: string): Promise<void> => {
    const response = await fetch(`${API_BASE}/risks/${id}`, {
      method: 'DELETE',
    });
    if (!response.ok) throw new Error('Failed to delete risk');
  }
};