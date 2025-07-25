import { ApiResponse } from "@/interfaces/base";
import {
	DonationRequest,
	DonationResult,
	GetAllDonationRequestsParams,
	PaginatedDonationResponse,
	PaginatedDonationResultResponse,
	UpdateStatusRequest,
} from "@/interfaces/donation";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import api from "../config/api";

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
				`/donations/requests/${id}/result`
			);
			return data.data;
		},
		enabled: !!id,
	});
};

// New Mutation to Update Donation Request Result
export const useUpdateDonationRequestResult = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      id,
      resultData,
    }: {
      id: string;
      resultData: {
        volumeMl: number;
        bloodGroup: string;
        bloodRh: string;
        notes?: string;
        rejectReason?: string;
        status: "completed" | "rejected";
      };
    }) => {
      const { data }: { data: ApiResponse<DonationRequest> } = await api.patch(
        `/donations/requests/${id}/result`,
        resultData
      );
      return data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["donationRequests"] });
      queryClient.invalidateQueries({ queryKey: ["donationRequest"] });
    },
  });
};