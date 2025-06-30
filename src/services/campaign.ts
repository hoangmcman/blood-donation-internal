import api from '../config/api';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

export interface Campaign {
  id: string;
  name: string;
  description: string;
  status: string;
  startDate: string;
  endDate: string;
  createdAt: string;
  updatedAt: string;
  banner: string;
  location: string;
  limitDonation: number;
  bloodCollectionDate?: string;
}

export interface Donor {
  id: string;
  firstName: string;
  lastName: string;
}

export interface DonationRequest {
  id: string;
  donor: Donor;
  campaign: {
    id: string;
    name: string;
  };
  amount: number;
  note: string;
  appointmentDate: string;
  currentStatus: 'pending' | 'completed' | 'failed';
  createdAt: string;
  updatedAt: string;
}

export interface PaginationMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
}

export interface DonationRequestResponse {
  success: boolean;
  message: string;
  data: {
    data: DonationRequest[];
    meta: PaginationMeta;
  };
}

export interface CampaignResponse {
  success: boolean;
  message: string;
  data: {
    data: Campaign[];
    meta: PaginationMeta;
  };
}

export interface CreateCampaignPayload {
  name: string;
  description?: string;
  status: string;
  startDate: string;
  endDate?: string;
  banner: string;
  location: string;
  limitDonation: number;
}

export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
}

// Read (Get Campaigns)
export const getCampaigns = async (page: number = 1, limit: number = 10): Promise<CampaignResponse> => {
  const response = await api.get<CampaignResponse>('/campaigns', {
    params: { page, limit },
  });
  return response.data;
};

export const useGetCampaigns = (page: number = 1, limit: number = 10) => {
  return useQuery({
    queryKey: ['campaigns', page, limit],
    queryFn: () => getCampaigns(page, limit),
  });
};

// Read (Get Campaign by ID)
export const getCampaignById = async (id: string): Promise<ApiResponse<Campaign>> => {
  const response = await api.get<ApiResponse<Campaign>>(`/campaigns/${id}`);
  return response.data;
};

export const useGetCampaignById = (id: string) => {
  return useQuery({
    queryKey: ['campaign', id],
    queryFn: () => getCampaignById(id),
    enabled: !!id,
  });
};

// Read (Get Donation Requests for a Campaign)
export const getDonationRequests = async (id: string, status?: string, limit: number = 10, page: number = 1): Promise<DonationRequestResponse> => {
  const params: { limit: number; page: number; status?: string } = { limit, page };
  if (status) params.status = status;

  const response = await api.get<DonationRequestResponse>(`/campaigns/${id}/donation-requests`, {
    params,
  });
  return response.data;
};

export const useGetDonationRequests = (id: string, status?: string, limit: number = 10, page: number = 1) => {
  return useQuery({
    queryKey: ['donationRequests', id, status, page, limit],
    queryFn: () => getDonationRequests(id, status, limit, page),
    enabled: !!id,
  });
};

// Create
export const createCampaign = async (payload: CreateCampaignPayload): Promise<ApiResponse<Campaign>> => {
  const response = await api.post<ApiResponse<Campaign>>('/campaigns', payload);
  return response.data;
};

export const useCreateCampaign = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: createCampaign,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['campaigns'] });
    },
  });
};

// Update
export const updateCampaign = async (id: string, payload: Partial<CreateCampaignPayload>): Promise<ApiResponse<Campaign>> => {
  const response = await api.patch<ApiResponse<Campaign>>(`/campaigns/${id}`, payload);
  return response.data;
};

export const useUpdateCampaign = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (variables: { id: string; payload: Partial<CreateCampaignPayload> }) =>
      updateCampaign(variables.id, variables.payload),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['campaigns'] });
      queryClient.invalidateQueries({ queryKey: ['campaign', variables.id] });
    },
  });
};

// Delete
export const deleteCampaign = async (id: string): Promise<ApiResponse<void>> => {
  const response = await api.delete<ApiResponse<void>>(`/campaigns/${id}`);
  return response.data;
};

export const useDeleteCampaign = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: deleteCampaign,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['campaigns'] });
    },
  });
}