import { apiClient } from './client';
export const attestationApi = {
  create: (data: { batchId: string; attestor: string; txHash: string }) => apiClient.post('/attestation/', data).then(r => r.data),
  getByBatch: (batchId: string) => apiClient.get('/attestation/' + batchId).then(r => r.data),
};
