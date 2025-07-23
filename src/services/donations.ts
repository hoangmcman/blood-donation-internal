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

export interface Option {
  id: string;
  label: string;
}

export interface Item {
  id: string;
  type: string;
  label: string;
  description: string;
  placeholder?: string;
  defaultValue?: string;
  sortOrder: number;
  minValue?: number;
  maxValue?: number;
  minLength?: number;
  maxLength?: number;
  isRequired: boolean;
  pattern?: string;
  options?: Option[];
}

export interface DonationResultTemplate {
  id: string;
  name: string;
  description: string;
  active: boolean;
  createdAt: string;
  updatedAt: string;
  createdBy: {
    id: string;
    firstName: string;
    lastName: string;
  };
  updatedBy: {
    id: string;
    firstName: string;
    lastName: string;
  };
  items: Item[];
}

export interface BloodTestResult {
  [key: string]: string; // Dynamic properties for additionalProp1, additionalProp2, etc.
}

export interface DonationResult {
  id: string;
  campaignDonation: {
    id: string;
    currentStatus: string;
    donor: {
      id: string;
      firstName: string;
      lastName: string;
    };
  };
  bloodTestResults: BloodTestResult;
  template: DonationResultTemplate;
  resultDate: string;
  notes?: string;
  processedBy: {
    id: string;
    firstName: string;
    lastName: string;
  };
  createdAt: string;
  updatedAt: string;
}

export interface UpdateDonationResultPayload {
  volumeMl: number
  bloodgroup: string   // ✅ Thêm vào nếu API cần
  bloodrh: string
  notes: string
  rejectReason?: string
  status: "completed" | "rejected"
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

export interface PaginatedDonationResultResponse {
  items: DonationResult[];
  meta: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNextPage: boolean;
    hasPreviousPage: boolean;
  };
}

// Existing Donation Request APIs
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

// New Donation Result APIs
export const useGetDonationResults = (page: number = 1, limit: number = 10) => {
  return useQuery<PaginatedDonationResultResponse, Error>({
    queryKey: ['donationResults', page, limit],
    queryFn: async () => {
      const { data }: { data: ApiResponse<PaginatedDonationResultResponse> } = await api.get(
        '/donations/results',
        {
          params: { page, limit },
        }
      );
      return data.data;
    },
  });
};

export const useGetDonationResultById = (id: string) => {
  return useQuery<DonationResult, Error>({
    queryKey: ['donationResult', id],
    queryFn: async () => {
      const { data }: { data: ApiResponse<DonationResult> } = await api.get(
        `/donations/results/${id}`
      );
      return data.data;
    },
    enabled: !!id,
  });
};

export const useUpdateDonationResult = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      id,
      updateData,
    }: {
      id: string;
      updateData: UpdateDonationResultPayload;
    }) => {
      const { data }: { data: ApiResponse<DonationResult> } = await api.patch(
        `/donations/requests/${id}/result`,
        updateData
      );
      return data.data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['donationResults'] });
      queryClient.invalidateQueries({ queryKey: ['donationResult', data.id] });
      queryClient.invalidateQueries({ queryKey: ['donationRequests'] }); // Invalidate requests if status changes affect them
    },
  });
};