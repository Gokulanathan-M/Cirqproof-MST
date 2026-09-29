import { apiClient } from './client';
export const batchesApi = {
  getBatches: (page = 1, limit = 20) => apiClient.get('/batches?page=' + page + '&limit=' + limit).then(r => r.data),
  getBatch: (id: string) => apiClient.get('/batches/' + id).then(r => r.data),
  createBatch: (data: any) => apiClient.post('/batches/', data).then(r => r.data),
};
