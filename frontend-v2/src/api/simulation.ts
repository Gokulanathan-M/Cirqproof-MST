import { apiClient } from './client';
export const simulationApi = {
  generate: (data: any) => apiClient.post('/simulation/generate', data).then(r => r.data),
  tamper: (batchId: string) => apiClient.post('/simulation/tamper/' + batchId).then(r => r.data),
  getScenarios: () => apiClient.get('/simulation/scenarios').then(r => r.data),
  getEvents: (batchId: string) => apiClient.get('/simulation/events/' + batchId).then(r => r.data),
};
