import { apiClient } from './client';
export const evidenceApi = {
  upload: (data: FormData) => apiClient.post('/evidence/upload', data, { headers: { 'Content-Type': 'multipart/form-data' } }).then(r => r.data),
  createEvents: (data: any) => apiClient.post('/evidence/events', data).then(r => r.data),
  getEvidence: (batchId: string) => apiClient.get('/evidence/' + batchId).then(r => r.data),
  checkIntegrity: (batchId: string) => apiClient.get('/evidence/' + batchId + '/integrity').then(r => r.data),
};
