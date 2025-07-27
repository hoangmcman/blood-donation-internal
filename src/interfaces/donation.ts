import { PaginationMeta } from "./pagination";

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
		canChangeBloodType?: boolean;
	};
	currentStatus: string;
	appointmentDate: string;
	volumeMl?: number;
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
	resultDate: string;
	notes?: string;
	volumeMl?: number; // Thêm thuộc tính volumeMl
	processedBy: {
		id: string;
		firstName: string;
		lastName: string;
	};
	createdAt: string;
	updatedAt: string;
}

export interface UpdateDonationResultPayload {
	templateId: string;
	bloodTestResults: BloodTestResult;
	resultDate?: string;
	notes?: string;
}

export interface UpdateStatusRequest {
	status: string;
	appointmentDate?: string;
	note?: string;
	volumeMl?: number;
}

export interface PaginatedDonationResponse {
	items: DonationRequest[];
	total: number;
}

export interface PaginatedDonationResultResponse {
	items: DonationResult[];
	meta: PaginationMeta;
}

// GET
export interface GetAllDonationRequestsParams {
	status?: string;
	page?: number;
	limit?: number;
	campaignId?: string;
}