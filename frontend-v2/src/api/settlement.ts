import { apiClient } from './client';
export const settlementApi = {
  list: () => apiClient.get('/settlement').then(r => r.data),
  deposit: (data: { batchId: string; amount: number; payer: string; txHash: string }) => apiClient.post('/settlement/deposit', data).then(r => r.data),
  release: (data: { batchId: string; txHash: string }) => apiClient.post('/settlement/release', data).then(r => r.data),
};
