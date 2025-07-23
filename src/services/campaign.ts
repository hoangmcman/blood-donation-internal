import { ApiResponse } from "@/interfaces/base";
import {
	Campaign,
	CampaignResponse,
	CreateCampaignPayload,
	DonationRequestResponse,
	GetAllCampaignsParams,
} from "@/interfaces/campaign";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import api from "../config/api";

// Read (Get Available Campaigns)
export const getCampaigns = async (params?: GetAllCampaignsParams): Promise<CampaignResponse> => {
	const response = await api.get<CampaignResponse>("/campaigns", {
		params,
	});
	return response.data;
};

export const useGetCampaigns = (params?: GetAllCampaignsParams) => {
	return useQuery<CampaignResponse, Error>({
		queryKey: ["campaigns", params],
		queryFn: () => getCampaigns(params),
	});
};

// Read (Get Campaign by ID)
export const getCampaignById = async (id: string): Promise<ApiResponse<Campaign>> => {
	const response = await api.get<ApiResponse<Campaign>>(`/campaigns/${id}`);
	return response.data;
};

export const useGetCampaignById = (id: string) => {
	return useQuery({
		queryKey: ["campaign", id],
		queryFn: () => getCampaignById(id),
		enabled: !!id,
	});
};

// Read (Get Donation Requests for a Campaign)
export const getDonationRequests = async (
	id: string,
	status?: string,
	limit: number = 10,
	page: number = 1
): Promise<DonationRequestResponse> => {
	const params: { limit: number; page: number; status?: string } = { limit, page };
	if (status) params.status = status;

	const response = await api.get<DonationRequestResponse>(`/campaigns/${id}/donation-requests`, {
		params,
	});
	return response.data;
};

export const useGetDonationRequests = (
	id: string,
	status?: string,
	limit: number = 10,
	page: number = 1
) => {
	return useQuery({
		queryKey: ["donationRequests", id, status, page, limit],
		queryFn: () => getDonationRequests(id, status, limit, page),
		enabled: !!id,
	});
};

// Create
export const createCampaign = async (
	payload: CreateCampaignPayload
): Promise<ApiResponse<Campaign>> => {
	const response = await api.post<ApiResponse<Campaign>>("/campaigns", payload);
	return response.data;
};

export const useCreateCampaign = () => {
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: createCampaign,
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ["campaigns"] });
		},
	});
};

// Update
export const updateCampaign = async (
	id: string,
	payload: Partial<CreateCampaignPayload>
): Promise<ApiResponse<Campaign>> => {
	const response = await api.patch<ApiResponse<Campaign>>(`/campaigns/${id}`, payload);
	return response.data;
};

export const useUpdateCampaign = () => {
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: (variables: { id: string; payload: Partial<CreateCampaignPayload> }) =>
			updateCampaign(variables.id, variables.payload),
		onSuccess: (_, variables) => {
			queryClient.invalidateQueries({ queryKey: ["campaigns"] });
			queryClient.invalidateQueries({ queryKey: ["campaign", variables.id] });
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
			queryClient.invalidateQueries({ queryKey: ["campaigns"] });
		},
	});
};
