import { ApiResponse } from "@/interfaces/base";
import {
	DonationRequest,
	DonationResult,
	GetAllDonationRequestsParams,
	PaginatedDonationResponse,
	PaginatedDonationResultResponse,
	UpdateDonationResultPayload,
	UpdateStatusRequest,
} from "@/interfaces/donation";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import api from "../config/api";
import { DonationResultTemplate } from "./donationresulttemplates";

const getDonationRequests = async (
	params?: GetAllDonationRequestsParams
): Promise<PaginatedDonationResponse> => {
	const response = await api.get<ApiResponse<PaginatedDonationResponse>>("/donations/requests", {
		params,
	});
	return response.data.data;
};

// Existing Donation Request APIs
export const useGetDonationRequests = (params?: GetAllDonationRequestsParams) => {
	return useQuery<PaginatedDonationResponse, Error>({
		queryKey: ["donationRequests", params],
		queryFn: async () => await getDonationRequests(params),
	});
};

export const useGetDonationRequestById = (id: string) => {
	return useQuery<DonationRequest, Error>({
		queryKey: ["donationRequest", id],
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
		mutationFn: async ({ id, statusData }: { id: string; statusData: UpdateStatusRequest }) => {
			const { data }: { data: ApiResponse<DonationRequest> } = await api.patch(
				`/donations/requests/${id}/status`,
				statusData
			);
			return data.data;
		},
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ["donationRequests"] });
		},
	});
};

// New Donation Result APIs
export const useGetDonationResults = (page: number = 1, limit: number = 10) => {
	return useQuery<PaginatedDonationResultResponse, Error>({
		queryKey: ["donationResults", page, limit],
		queryFn: async () => {
			const { data }: { data: ApiResponse<PaginatedDonationResultResponse> } = await api.get(
				"/donations/results",
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
		queryKey: ["donationResult", id],
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
			// Fetch the template snapshot based on templateId
			const { data: templateResponse }: { data: ApiResponse<DonationResultTemplate> } =
				await api.get(`/donation-result-templates/${updateData.templateId}`);
			const templateSnapshot = templateResponse.data;

			// Prepare payload with template snapshot and update blood test results
			const payload = {
				...updateData,
				template: templateSnapshot,
				currentStatus: "RESULT_RETURNED", // Automatically set status
			};

			const { data }: { data: ApiResponse<DonationResult> } = await api.patch(
				`/donations/results/${id}`,
				payload
			);
			return data.data;
		},
		onSuccess: (data) => {
			queryClient.invalidateQueries({ queryKey: ["donationResults"] });
			queryClient.invalidateQueries({ queryKey: ["donationResult", data.id] });
			queryClient.invalidateQueries({ queryKey: ["donationRequests"] }); // Invalidate requests if status changes affect them
		},
	});
};
