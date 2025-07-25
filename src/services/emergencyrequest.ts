import { ApiResponse } from "@/interfaces/base";
import {
	ApproveEmergencyRequestPayload,
	EmergencyRequestByIdResponse,
	EmergencyRequestLog,
	EmergencyRequestLogByIdResponse,
	EmergencyRequestLogResponse,
	EmergencyRequestResponse,
	GetAllEmergencyRequestsParams,
	ProvideContactsBody,
	RejectAllEmergencyRequestsPayload,
	RejectEmergencyRequestPayload,
} from "@/interfaces/emergency-request";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import api from "../config/api";

// EmergencyRequest CRUD Operations
export const getEmergencyRequestLogs = async (
	page: number = 1,
	limit: number = 10
): Promise<EmergencyRequestLogResponse> => {
	const response = await api.get<EmergencyRequestLogResponse>("/emergency-requests/logs/all", {
		params: { page, limit },
	});
	return response.data;
};

export const useGetEmergencyRequestLogs = (page: number = 1, limit: number = 10) => {
	return useQuery({
		queryKey: ["emergencyRequestLogs", page, limit],
		queryFn: () => getEmergencyRequestLogs(page, limit),
	});
};

export const getEmergencyRequestLogById = async (
	id: string
): Promise<EmergencyRequestLogByIdResponse> => {
	const response = await api.get<EmergencyRequestLogByIdResponse>(`/emergency-requests/logs/${id}`);
	return response.data;
};

export const useGetEmergencyRequestLogById = (id: string) => {
	return useQuery({
		queryKey: ["emergencyRequestLog", id],
		queryFn: () => getEmergencyRequestLogById(id),
		enabled: !!id,
	});
};

export const getEmergencyRequestById = async (
	id: string
): Promise<EmergencyRequestByIdResponse> => {
	const response = await api.get<EmergencyRequestByIdResponse>(`/emergency-requests/${id}`);
	return response.data;
};

export const useGetEmergencyRequestById = (id: string, options?: { enabled?: boolean }) => {
	return useQuery({
		queryKey: ["emergencyRequest", id],
		queryFn: () => getEmergencyRequestById(id),
		enabled: !!id && options?.enabled !== false,
	});
};

export const getEmergencyRequests = async (
	params?: GetAllEmergencyRequestsParams
): Promise<EmergencyRequestResponse> => {
	const response = await api.get<EmergencyRequestResponse>("/emergency-requests", {
		params,
	});
	return response.data;
};

export const useGetEmergencyRequests = (params?: GetAllEmergencyRequestsParams) => {
	return useQuery({
		queryKey: ["emergencyRequests", params],
		queryFn: () => getEmergencyRequests(params),
	});
};

export const approveEmergencyRequest = async (
	id: string,
	payload: ApproveEmergencyRequestPayload
): Promise<ApiResponse<EmergencyRequestLog>> => {
	const response = await api.patch<ApiResponse<EmergencyRequestLog>>(
		`/emergency-requests/${id}/approve`,
		payload
	);
	return response.data;
};

export const useApproveEmergencyRequest = () => {
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: (variables: { id: string; payload: ApproveEmergencyRequestPayload }) =>
			approveEmergencyRequest(variables.id, variables.payload),
		onSuccess: (_, variables) => {
			queryClient.invalidateQueries({ queryKey: ["emergencyRequestLogs"] });
			queryClient.invalidateQueries({ queryKey: ["emergencyRequestLog", variables.id] });
		},
	});
};

export const rejectEmergencyRequest = async (
	id: string,
	payload: RejectEmergencyRequestPayload
): Promise<ApiResponse<EmergencyRequestLog>> => {
	const response = await api.patch<ApiResponse<EmergencyRequestLog>>(
		`/emergency-requests/${id}/reject`,
		payload
	);
	return response.data;
};

export const useRejectEmergencyRequest = () => {
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: (variables: { id: string; payload: RejectEmergencyRequestPayload }) =>
			rejectEmergencyRequest(variables.id, variables.payload),
		onSuccess: (_, variables) => {
			queryClient.invalidateQueries({ queryKey: ["emergencyRequestLogs"] });
			queryClient.invalidateQueries({ queryKey: ["emergencyRequestLog", variables.id] });
		},
	});
};

export const rejectAllEmergencyRequests = async (
	payload: RejectAllEmergencyRequestsPayload
): Promise<ApiResponse<EmergencyRequestLog[]>> => {
	const response = await api.patch<ApiResponse<EmergencyRequestLog[]>>(
		"/emergency-requests/reject-by-blood-type",
		payload
	);
	return response.data;
};

export const useRejectAllEmergencyRequests = () => {
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: (payload: RejectAllEmergencyRequestsPayload) => rejectAllEmergencyRequests(payload),
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ["emergencyRequestLogs"] });
		},
	});
};

export const provideContactsForEmergencyRequest = async (id: string, body: ProvideContactsBody) => {
	const response = await api.patch<ApiResponse<EmergencyRequestLog>>(
		`/emergency-requests/${id}/provide-contacts`,
		body
	);
	return response.data;
};

export const useProvideContactsForEmergencyRequest = () => {
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: (variables: { id: string; body: ProvideContactsBody }) =>
			provideContactsForEmergencyRequest(variables.id, variables.body),
		onSuccess: (_, variables) => {
			queryClient.invalidateQueries({ queryKey: ["emergencyRequestLogs"] });
			queryClient.invalidateQueries({ queryKey: ["emergencyRequestLog", variables.id] });
			queryClient.invalidateQueries({ queryKey: ["emergencyRequests"] });
		},
	});
};
