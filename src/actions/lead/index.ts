import api from '@/utils/api';
import type { PublicLeadRegistrationRequest, PublicLeadRegistrationResponse } from '@/types';

export const submitPublicLeadRegistration = async (
  payload: PublicLeadRegistrationRequest,
): Promise<PublicLeadRegistrationResponse> => {
  const response = await api.post<PublicLeadRegistrationResponse>(
    '/api/v1/public/lead-registrations',
    payload,
  );
  return response.data;
};
