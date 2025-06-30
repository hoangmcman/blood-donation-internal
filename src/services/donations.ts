import api from '../config/api';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

export interface DonationRequest {
  id: string;
  createdAt: string;
  updatedAt: string;
  campaign: {
    id: string;
    name: string;
    status: string;
    description?: string;
    startDate?: string;
    endDate?: string;
    banner?: string;
    location?: string;
    limitDonation?: number;
    bloodCollectionDate?: string;
  };
  donor: {
    id: string;
    firstName: string;
    lastName: string;
    bloodType?: {
      group: string;
      rh: string;
    };
    phone?: string;
    wardName?: string;
    districtName?: string;
    provinceName?: string;
  };
  currentStatus: string;
  appointmentDate: string;
}


export interface UpdateStatusRequest {
  status: string;
  appointmentDate?: string;
  note?: string;
}

export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
}

export interface PaginatedDonationResponse {
  items: DonationRequest[];
  total: number;
}

export const useGetDonationRequests = (status?: string) => {
  return useQuery<DonationRequest[], Error>({
    queryKey: ['donationRequests', status],
    queryFn: async () => {
      const { data }: { data: ApiResponse<PaginatedDonationResponse> } = await api.get(
        '/donations/requests',
        {
          params: status ? { status } : {},
        }
      );
      return data.data.items;
    },
  });
};

export const useGetDonationRequestById = (id: string) => {
  return useQuery<DonationRequest, Error>({
    queryKey: ['donationRequest', id],
    queryFn: async () => {
      const { data }: { data: ApiResponse<DonationRequest> } = await api.get(
        `/donations/requests/${id}`
      );
      return data.data;
    },
    enabled: !!id,
  });
};

export const useUpdateDonationStatus = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      id,
      statusData,
    }: {
      id: string;
      statusData: UpdateStatusRequest;
    }) => {
      const { data }: { data: ApiResponse<DonationRequest> } = await api.patch(
        `/donations/requests/${id}/status`,
        statusData
      );
      return data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['donationRequests'] });
    },
  });
};
