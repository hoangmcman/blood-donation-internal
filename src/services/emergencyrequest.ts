import api from '../config/api';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

// EmergencyRequest Interfaces
export interface BloodType {
  group: string;
  rh: string;
}

export interface EmergencyRequest {
  id: string;
  createdAt: string;
  updatedAt: string;
  requestedBy: string;
  bloodUnit: string | null;
  usedVolume: number;
  requiredVolume: number;
  bloodType: BloodType;
  bloodTypeComponent: string;
  status: string;
  description: string;
  rejectionReason: string | null;
  startDate: string;
  endDate: string;
  wardCode: string;
  districtCode: string;
  provinceCode: string;
  wardName: string;
  districtName: string;
  provinceName: string;
  longitude: string;
  latitude: string;
}

export interface Staff {
  id: string;
  createdAt: string;
  updatedAt: string;
  account: string;
  firstName: string;
  lastName: string;
  role: string;
}

export interface Account {
  id: string;
  createdAt: string;
  updatedAt: string;
  email: string;
  role: string;
}

export interface EmergencyRequestLog {
  id: string;
  createdAt: string;
  updatedAt: string;
  emergencyRequest: EmergencyRequest;
  staff: Staff | null;
  account: Account | null;
  status: string;
  note: string;
  previousValue: string;
  newValue: string;
}

export interface PaginationMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
}

export interface EmergencyRequestLogResponse {
  success: boolean;
  message: string;
  data: {
    data: EmergencyRequestLog[];
    meta: PaginationMeta;
  };
}

export interface EmergencyRequestLogByIdResponse {
  success: boolean;
  message: string;
  data: EmergencyRequestLog;
}

export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
}

// Payload Interfaces
export interface ApproveEmergencyRequestPayload {
  bloodUnitId: string;
  usedVolume: string;
}

export interface RejectEmergencyRequestPayload {
  rejectionReason: string;
}

export interface RejectAllEmergencyRequestsPayload {
  rejectionReason: string;
}

// EmergencyRequest CRUD Operations
export const getEmergencyRequestLogs = async (page: number = 1, limit: number = 10): Promise<EmergencyRequestLogResponse> => {
  const response = await api.get<EmergencyRequestLogResponse>('/emergency-requests/logs/all', {
    params: { page, limit },
  });
  return response.data;
};

export const useGetEmergencyRequestLogs = (page: number = 1, limit: number = 10) => {
  return useQuery({
    queryKey: ['emergencyRequestLogs', page, limit],
    queryFn: () => getEmergencyRequestLogs(page, limit),
  });
};

export const getEmergencyRequestLogById = async (id: string): Promise<EmergencyRequestLogByIdResponse> => {
  const response = await api.get<EmergencyRequestLogByIdResponse>(`/emergency-requests/logs/${id}`);
  return response.data;
};

export const useGetEmergencyRequestLogById = (id: string) => {
  return useQuery({
    queryKey: ['emergencyRequestLog', id],
    queryFn: () => getEmergencyRequestLogById(id),
    enabled: !!id,
  });
};

export const approveEmergencyRequest = async (id: string, payload: ApproveEmergencyRequestPayload): Promise<ApiResponse<EmergencyRequestLog>> => {
  const response = await api.patch<ApiResponse<EmergencyRequestLog>>(`/emergency-requests/${id}/approve`, payload);
  return response.data;
};

export const useApproveEmergencyRequest = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (variables: { id: string; payload: ApproveEmergencyRequestPayload }) =>
      approveEmergencyRequest(variables.id, variables.payload),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['emergencyRequestLogs'] });
      queryClient.invalidateQueries({ queryKey: ['emergencyRequestLog', variables.id] });
    },
  });
};

export const rejectEmergencyRequest = async (id: string, payload: RejectEmergencyRequestPayload): Promise<ApiResponse<EmergencyRequestLog>> => {
  const response = await api.patch<ApiResponse<EmergencyRequestLog>>(`/emergency-requests/${id}/reject`, payload);
  return response.data;
};

export const useRejectEmergencyRequest = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (variables: { id: string; payload: RejectEmergencyRequestPayload }) =>
      rejectEmergencyRequest(variables.id, variables.payload),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['emergencyRequestLogs'] });
      queryClient.invalidateQueries({ queryKey: ['emergencyRequestLog', variables.id] });
    },
  });
};

export const rejectAllEmergencyRequests = async (payload: RejectAllEmergencyRequestsPayload): Promise<ApiResponse<EmergencyRequestLog[]>> => {
  const response = await api.patch<ApiResponse<EmergencyRequestLog[]>>('/emergency-requests/reject-by-blood-type', payload);
  return response.data;
};

export const useRejectAllEmergencyRequests = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: RejectAllEmergencyRequestsPayload) => rejectAllEmergencyRequests(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['emergencyRequestLogs'] });
    },
  });
};