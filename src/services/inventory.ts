import { ApiResponse } from "@/interfaces/base";
import {
	BloodUnit,
	BloodUnitAction,
	BloodUnitActionResponse,
	BloodUnitResponse,
	CreateBloodUnitActionPayload,
	CreateBloodUnitPayload,
	GetAllBloodUnitsParams,
	SeparateComponentsPayload,
	SeparateComponentsResponse,
} from "@/interfaces/inventory";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import api from "../config/api";

// BloodUnit CRUD Operations
export const getBloodUnits = async (params: GetAllBloodUnitsParams): Promise<BloodUnitResponse> => {
	const response = await api.get<BloodUnitResponse>("/inventory/blood-units", {
		params,
	});
	return response.data;
};

export const useGetBloodUnits = (
	params: GetAllBloodUnitsParams,
	options?: { enabled?: boolean }
) => {
	return useQuery({
		queryKey: ["bloodUnits", params],
		queryFn: () => getBloodUnits(params),
		enabled: options?.enabled !== false,
	});
};

// Rest of the file remains unchanged...
export const getBloodUnitById = async (id: string): Promise<ApiResponse<BloodUnit>> => {
	const response = await api.get<ApiResponse<BloodUnit>>(`/inventory/blood-units/${id}`);
	return response.data;
};

export const useGetBloodUnitById = (id: string) => {
	return useQuery({
		queryKey: ["bloodUnit", id],
		queryFn: () => getBloodUnitById(id),
		enabled: !!id,
	});
};

export const createBloodUnit = async (
	payload: CreateBloodUnitPayload
): Promise<ApiResponse<BloodUnit>> => {
	const response = await api.post<ApiResponse<BloodUnit>>(
		"/inventory/blood-units/whole-blood",
		payload
	);
	return response.data;
};

export const useCreateBloodUnit = () => {
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: createBloodUnit,
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ["bloodUnits"] });
		},
	});
};

export const updateBloodUnit = async (
	id: string,
	payload: Partial<CreateBloodUnitPayload>
): Promise<ApiResponse<BloodUnit>> => {
	const response = await api.patch<ApiResponse<BloodUnit>>(`/inventory/blood-units/${id}`, payload);
	return response.data;
};

export const useUpdateBloodUnit = () => {
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: (variables: { id: string; payload: Partial<CreateBloodUnitPayload> }) =>
			updateBloodUnit(variables.id, variables.payload),
		onSuccess: (_, variables) => {
			queryClient.invalidateQueries({ queryKey: ["bloodUnits"] });
			queryClient.invalidateQueries({ queryKey: ["bloodUnit", variables.id] });
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
			queryClient.invalidateQueries({ queryKey: ["bloodUnits"] });
		},
	});
};

// BloodUnitAction CRUD Operations
export const getBloodUnitActions = async (
	page: number = 1,
	limit: number = 10,
	staffId?: string,
	bloodUnitId?: string,
	action?: string
): Promise<BloodUnitActionResponse> => {
	const response = await api.get<BloodUnitActionResponse>("/inventory/blood-unit-actions", {
		params: { page, limit, staffId, bloodUnitId, action },
	});
	return response.data;
};

export const useGetBloodUnitActions = (
	page: number = 1,
	limit: number = 10,
	staffId?: string,
	bloodUnitId?: string,
	action?: string
) => {
	return useQuery({
		queryKey: ["bloodUnitActions", page, limit, staffId, bloodUnitId, action],
		queryFn: () => getBloodUnitActions(page, limit, staffId, bloodUnitId, action),
	});
};

export const getBloodUnitActionById = async (id: string): Promise<ApiResponse<BloodUnitAction>> => {
	const response = await api.get<ApiResponse<BloodUnitAction>>(
		`/inventory/blood-unit-actions/${id}`
	);
	return response.data;
};

export const useGetBloodUnitActionById = (id: string) => {
	return useQuery({
		queryKey: ["bloodUnitAction", id],
		queryFn: () => getBloodUnitActionById(id),
		enabled: !!id,
	});
};

export const createBloodUnitAction = async (
	payload: CreateBloodUnitActionPayload
): Promise<ApiResponse<BloodUnitAction>> => {
	const response = await api.post<ApiResponse<BloodUnitAction>>(
		"/inventory/blood-unit-actions",
		payload
	);
	return response.data;
};

export const useCreateBloodUnitAction = () => {
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: createBloodUnitAction,
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ["bloodUnitActions"] });
		},
	});
};

export const updateBloodUnitAction = async (
	id: string,
	payload: Partial<CreateBloodUnitActionPayload>
): Promise<ApiResponse<BloodUnitAction>> => {
	const response = await api.patch<ApiResponse<BloodUnitAction>>(
		`/inventory/blood-unit-actions/${id}`,
		payload
	);
	return response.data;
};

export const useUpdateBloodUnitAction = () => {
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: (variables: { id: string; payload: Partial<CreateBloodUnitActionPayload> }) =>
			updateBloodUnitAction(variables.id, variables.payload),
		onSuccess: (_, variables) => {
			queryClient.invalidateQueries({ queryKey: ["bloodUnitActions"] });
			queryClient.invalidateQueries({ queryKey: ["bloodUnitAction", variables.id] });
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
			queryClient.invalidateQueries({ queryKey: ["bloodUnitActions"] });
		},
	});
};

// New Separate Components Operation
export const separateComponents = async (
	payload: SeparateComponentsPayload
): Promise<ApiResponse<SeparateComponentsResponse>> => {
	const response = await api.post<ApiResponse<SeparateComponentsResponse>>(
		"/inventory/blood-units/separate-components",
		payload
	);
	return response.data;
};

export const useSeparateComponents = () => {
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: separateComponents,
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ["bloodUnits"] });
		},
	});
};
