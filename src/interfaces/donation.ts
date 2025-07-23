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
	templateId: string;
	bloodTestResults: BloodTestResult;
	resultDate?: string;
	notes?: string;
}

export interface UpdateStatusRequest {
	status: string;
	appointmentDate?: string;
	note?: string;
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
