import api from '../config/api';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

// BloodUnit Interfaces
export interface BloodType {
  group: string;
  rh: string;
}

export interface Member {
  firstName: string;
  lastName: string;
  bloodType: BloodType | null;
}

export interface BloodUnit {
  id: string;
  createdAt: string;
  updatedAt: string;
  member: Member;
  bloodType: BloodType;
  bloodVolume: number;
  remainingVolume: number;
  expiredDate: string;
  status: string;
}

export interface PaginationMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
}

export interface BloodUnitResponse {
  success: boolean;
  message: string;
  data: {
    data: BloodUnit[];
    meta: PaginationMeta;
  };
}

export interface CreateBloodUnitPayload {
  memberId: string;
  bloodGroup: string;
  bloodRh: string;
  bloodVolume: number;
  remainingVolume: number;
  expiredDate: string;
  status: string;
}

export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
}

// BloodUnitAction Interfaces
export interface BloodUnitAction {
  id: string;
  bloodUnit: BloodUnit;
  staff: {
    id: string;
    createdAt: string;
    updatedAt: string;
    account: string;
    firstName: string;
    lastName: string;
    role: string;
  };
  action: string;
  description: string;
  previousValue: string;
  newValue: string;
  createdAt: string;
  updatedAt: string;
}

export interface BloodUnitActionResponse {
  data: {
    data: BloodUnitAction[];
    meta: PaginationMeta;
  };
}

export interface CreateBloodUnitActionPayload {
  bloodUnitId: string;
  staffId: string;
  action: string;
  description: string;
  previousValue: string;
  newValue: string;
}

// BloodUnit CRUD Operations
export const getBloodUnits = async (page: number = 1, limit: number = 10): Promise<BloodUnitResponse> => {
  const response = await api.get<BloodUnitResponse>('/inventory/blood-units', {
    params: { page, limit },
  });
  return response.data;
};

export const useGetBloodUnits = (page: number = 1, limit: number = 10) => {
  return useQuery({
    queryKey: ['bloodUnits', page, limit],
    queryFn: () => getBloodUnits(page, limit),
  });
};

export const getBloodUnitById = async (id: string): Promise<ApiResponse<BloodUnit>> => {
  const response = await api.get<ApiResponse<BloodUnit>>(`/inventory/blood-units/${id}`);
  return response.data;
};

export const useGetBloodUnitById = (id: string) => {
  return useQuery({
    queryKey: ['bloodUnit', id],
    queryFn: () => getBloodUnitById(id),
    enabled: !!id,
  });
};

export const createBloodUnit = async (payload: CreateBloodUnitPayload): Promise<ApiResponse<BloodUnit>> => {
  const response = await api.post<ApiResponse<BloodUnit>>('/inventory/blood-units', payload);
  return response.data;
};

export const useCreateBloodUnit = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: createBloodUnit,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['bloodUnits'] });
    },
  });
};

export const updateBloodUnit = async (id: string, payload: Partial<CreateBloodUnitPayload>): Promise<ApiResponse<BloodUnit>> => {
  const response = await api.patch<ApiResponse<BloodUnit>>(`/inventory/blood-units/${id}`, payload);
  return response.data;
};

export const useUpdateBloodUnit = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (variables: { id: string; payload: Partial<CreateBloodUnitPayload> }) =>
      updateBloodUnit(variables.id, variables.payload),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['bloodUnits'] });
      queryClient.invalidateQueries({ queryKey: ['bloodUnit', variables.id] });
    },
  });
};

export const deleteBloodUnit = async (id: string): Promise<ApiResponse<void>> => {
  const response = await api.delete<ApiResponse<void>>(`/inventory/blood-units/${id}`);
  return response.data;
};

export const useDeleteBloodUnit = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: deleteBloodUnit,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['bloodUnits'] });
    },
  });
};

// BloodUnitAction CRUD Operations
export const getBloodUnitActions = async (page: number = 1, limit: number = 10, staffId?: string, bloodUnitId?: string, action?: string): Promise<BloodUnitActionResponse> => {
  const response = await api.get<BloodUnitActionResponse>('/inventory/blood-unit-actions', {
    params: { page, limit, staffId, bloodUnitId, action },
  });
  return response.data;
};

export const useGetBloodUnitActions = (page: number = 1, limit: number = 10, staffId?: string, bloodUnitId?: string, action?: string) => {
  return useQuery({
    queryKey: ['bloodUnitActions', page, limit, staffId, bloodUnitId, action],
    queryFn: () => getBloodUnitActions(page, limit, staffId, bloodUnitId, action),
  });
};

export const getBloodUnitActionById = async (id: string): Promise<ApiResponse<BloodUnitAction>> => {
  const response = await api.get<ApiResponse<BloodUnitAction>>(`/inventory/blood-unit-actions/${id}`);
  return response.data;
};

export const useGetBloodUnitActionById = (id: string) => {
  return useQuery({
    queryKey: ['bloodUnitAction', id],
    queryFn: () => getBloodUnitActionById(id),
    enabled: !!id,
  });
};

export const createBloodUnitAction = async (payload: CreateBloodUnitActionPayload): Promise<ApiResponse<BloodUnitAction>> => {
  const response = await api.post<ApiResponse<BloodUnitAction>>('/inventory/blood-unit-actions', payload);
  return response.data;
};

export const useCreateBloodUnitAction = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: createBloodUnitAction,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['bloodUnitActions'] });
    },
  });
};

export const updateBloodUnitAction = async (id: string, payload: Partial<CreateBloodUnitActionPayload>): Promise<ApiResponse<BloodUnitAction>> => {
  const response = await api.patch<ApiResponse<BloodUnitAction>>(`/inventory/blood-unit-actions/${id}`, payload);
  return response.data;
};

export const useUpdateBloodUnitAction = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (variables: { id: string; payload: Partial<CreateBloodUnitActionPayload> }) =>
      updateBloodUnitAction(variables.id, variables.payload),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['bloodUnitActions'] });
      queryClient.invalidateQueries({ queryKey: ['bloodUnitAction', variables.id] });
    },
  });
};

export const deleteBloodUnitAction = async (id: string): Promise<ApiResponse<void>> => {
  const response = await api.delete<ApiResponse<void>>(`/inventory/blood-unit-actions/${id}`);
  return response.data;
};

export const useDeleteBloodUnitAction = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: deleteBloodUnitAction,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['bloodUnitActions'] });
    },
  });
};