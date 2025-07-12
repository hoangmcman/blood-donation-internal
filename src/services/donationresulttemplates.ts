import api from '../config/api';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

// Donation Result Template Interfaces
export interface Option {
  id: string;
  label: string;
}

export interface Item {
  id: string;
  type: string;
  label: string;
  description: string;
  placeholder: string;
  defaultValue: string;
  sortOrder: number;
  minValue?: number;
  maxValue?: number;
  minLength?: number;
  maxLength?: number;
  isRequired: boolean;
  pattern: string;
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

export interface PaginationMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
}

export interface DonationResultTemplateResponse {
  success: boolean;
  message: string;
  data: {
    data: DonationResultTemplate[];
    meta: PaginationMeta;
  };
}

export interface CreateDonationResultTemplatePayload {
  name: string;
  description: string;
  active: boolean;
  items: Item[];
}

export interface UpdateDonationResultTemplatePayload {
  name?: string;
  description?: string;
  active?: boolean;
  items?: Item[];
}

export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
}

// Donation Result Template CRUD Operations
export const getDonationResultTemplates = async (page: number = 1, limit: number = 10): Promise<DonationResultTemplateResponse> => {
  const response = await api.get<DonationResultTemplateResponse>('/donation-result-templates', {
    params: { page, limit },
  });
  return response.data;
};

export const useGetDonationResultTemplates = (page: number = 1, limit: number = 10) => {
  return useQuery({
    queryKey: ['donationResultTemplates', page, limit],
    queryFn: () => getDonationResultTemplates(page, limit),
  });
};

export const getDonationResultTemplateById = async (id: string): Promise<ApiResponse<DonationResultTemplate>> => {
  const response = await api.get<ApiResponse<DonationResultTemplate>>(`/donation-result-templates/${id}`);
  return response.data;
};

export const useGetDonationResultTemplateById = (id: string) => {
  return useQuery({
    queryKey: ['donationResultTemplate', id],
    queryFn: () => getDonationResultTemplateById(id),
    enabled: !!id,
  });
};

export const createDonationResultTemplate = async (payload: CreateDonationResultTemplatePayload): Promise<ApiResponse<DonationResultTemplate>> => {
  const response = await api.post<ApiResponse<DonationResultTemplate>>('/donation-result-templates', payload);
  return response.data;
};

export const useCreateDonationResultTemplate = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: createDonationResultTemplate,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['donationResultTemplates'] });
    },
  });
};

export const updateDonationResultTemplate = async (id: string, payload: UpdateDonationResultTemplatePayload): Promise<ApiResponse<DonationResultTemplate>> => {
  const response = await api.patch<ApiResponse<DonationResultTemplate>>(`/donation-result-templates/${id}`, payload);
  return response.data;
};

export const useUpdateDonationResultTemplate = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (variables: { id: string; payload: UpdateDonationResultTemplatePayload }) =>
      updateDonationResultTemplate(variables.id, variables.payload),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['donationResultTemplates'] });
      queryClient.invalidateQueries({ queryKey: ['donationResultTemplate', variables.id] });
    },
  });
};

export const deleteDonationResultTemplate = async (id: string): Promise<ApiResponse<void>> => {
  const response = await api.delete<ApiResponse<void>>(`/donation-result-templates/${id}`);
  return response.data;
};

export const useDeleteDonationResultTemplate = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: deleteDonationResultTemplate,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['donationResultTemplates'] });
    },
  });
};

// Donation Result Template Item CRUD Operations
export const createDonationResultTemplateItem = async (templateId: string, payload: Item): Promise<ApiResponse<Item>> => {
  const response = await api.post<ApiResponse<Item>>(`/donation-result-templates/${templateId}/items`, payload);
  return response.data;
};

export const useCreateDonationResultTemplateItem = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (variables: { templateId: string; payload: Item }) =>
      createDonationResultTemplateItem(variables.templateId, variables.payload),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['donationResultTemplate', variables.templateId] });
    },
  });
};

export const updateDonationResultTemplateItem = async (templateId: string, itemId: string, payload: Partial<Item>): Promise<ApiResponse<Item>> => {
  const response = await api.patch<ApiResponse<Item>>(`/donation-result-templates/${templateId}/items/${itemId}`, payload);
  return response.data;
};

export const useUpdateDonationResultTemplateItem = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (variables: { templateId: string; itemId: string; payload: Partial<Item> }) =>
      updateDonationResultTemplateItem(variables.templateId, variables.itemId, variables.payload),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['donationResultTemplate', variables.templateId] });
    },
  });
};

export const deleteDonationResultTemplateItem = async (templateId: string, itemId: string): Promise<ApiResponse<void>> => {
  const response = await api.delete<ApiResponse<void>>(`/donation-result-templates/${templateId}/items/${itemId}`);
  return response.data;
};

export const useDeleteDonationResultTemplateItem = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (variables: { templateId: string; itemId: string }) =>
      deleteDonationResultTemplateItem(variables.templateId, variables.itemId),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['donationResultTemplate', variables.templateId] });
    },
  });
};

// Donation Result Template Item Option CRUD Operations
export const getDonationResultTemplateOptions = async (itemId: string, page: number = 1, limit: number = 10): Promise<ApiResponse<{ data: Option[]; meta: PaginationMeta }>> => {
  const response = await api.get<ApiResponse<{ data: Option[]; meta: PaginationMeta }>>(`/donation-result-templates/items/${itemId}/options`, {
    params: { page, limit },
  });
  return response.data;
};

export const useGetDonationResultTemplateOptions = (itemId: string, page: number = 1, limit: number = 10) => {
  return useQuery({
    queryKey: ['donationResultTemplateOptions', itemId, page, limit],
    queryFn: () => getDonationResultTemplateOptions(itemId, page, limit),
    enabled: !!itemId,
  });
};

export const getDonationResultTemplateOptionById = async (optionId: string): Promise<ApiResponse<Option>> => {
  const response = await api.get<ApiResponse<Option>>(`/donation-result-templates/options/${optionId}`);
  return response.data;
};

export const useGetDonationResultTemplateOptionById = (optionId: string) => {
  return useQuery({
    queryKey: ['donationResultTemplateOption', optionId],
    queryFn: () => getDonationResultTemplateOptionById(optionId),
    enabled: !!optionId,
  });
};

export const createDonationResultTemplateOption = async (itemId: string, payload: { label: string }): Promise<ApiResponse<Option>> => {
  const response = await api.post<ApiResponse<Option>>(`/donation-result-templates/items/${itemId}/options`, payload);
  return response.data;
};

export const useCreateDonationResultTemplateOption = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (variables: { itemId: string; payload: { label: string } }) =>
      createDonationResultTemplateOption(variables.itemId, variables.payload),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['donationResultTemplateOptions', variables.itemId] });
    },
  });
};

export const deleteDonationResultTemplateOption = async (optionId: string): Promise<ApiResponse<void>> => {
  const response = await api.delete<ApiResponse<void>>(`/donation-result-templates/options/${optionId}`);
  return response.data;
};

export const useDeleteDonationResultTemplateOption = () => {
  return useMutation({
    mutationFn: deleteDonationResultTemplateOption,
    onSuccess: () => {
      // Invalidate related queries if needed
    },
  });
};

// Validate Template Usage
export const validateTemplateUsage = async (id: string): Promise<ApiResponse<boolean>> => {
  const response = await api.get<ApiResponse<boolean>>(`/donation-result-templates/${id}/validate-usage`);
  return response.data;
};

export const useValidateTemplateUsage = (id: string) => {
  return useQuery({
    queryKey: ['validateTemplateUsage', id],
    queryFn: () => validateTemplateUsage(id),
    enabled: !!id,
  });
};