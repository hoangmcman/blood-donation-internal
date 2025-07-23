import { PaginationMeta } from "./pagination";

export interface Campaign {
	id: string;
	name: string;
	description: string;
	status: string;
	startDate: string;
	endDate: string;
	createdAt: string;
	updatedAt: string;
	banner: string;
	location: string;
	limitDonation: number;
	bloodCollectionDate?: string;
}

export interface Donor {
	id: string;
	firstName: string;
	lastName: string;
}

export interface DonationRequest {
	id: string;
	donor: Donor;
	campaign: {
		id: string;
		name: string;
	};
	amount: number;
	note: string;
	appointmentDate: string;
	currentStatus:
		| "pending"
		| "rejected"
		| "completed"
		| "result_returned"
		| "appointment_confirmed"
		| "appointment_cancelled"
		| "appointment_absent"
		| "customer_cancelled"
		| "customer_checked_in";
	createdAt: string;
	updatedAt: string;
}

export interface DonationRequestResponse {
	success: boolean;
	message: string;
	data: {
		data: DonationRequest[];
		meta: PaginationMeta;
	};
}

export interface CampaignResponse {
	success: boolean;
	message: string;
	data: {
		data: Campaign[];
		meta: PaginationMeta;
	};
}

export interface CreateCampaignPayload {
	name: string;
	description?: string;
	status: string;
	startDate: string;
	endDate?: string;
	banner: string;
	location: string;
	limitDonation: number;
}

export enum CampaignStatus {
	ACTIVE = "active",
	NOT_STARTED = "not_started",
	ENDED = "ended",
}

// GET
export interface GetAllCampaignsParams {
	search?: string;
	limit?: number;
	page?: number;
	status?: CampaignStatus;
}
