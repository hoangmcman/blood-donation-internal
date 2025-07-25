// EmergencyRequest Interfaces

import { Account, AccountUserRole, Staff } from "./account";
import { BloodComponentTypeOnly, BloodGroup, BloodRh, BloodType } from "./blood";
import { PaginationMeta } from "./pagination";

export enum EmergencyRequestStatus {
	PENDING = "pending",
	APPROVED = "approved",
	REJECTED = "rejected",
	CONTACTS_PROVIDED = "contacts_provided",
	EXPIRED = "expired",
}

export interface EmergencyRequest {
	id: string;
	createdAt: string;
	updatedAt: string;
	requestedBy: {
		id: string;
		createdAt: string;
		updatedAt: string;
		email: string;
		role: string;
	};
	bloodUnit: string | null;
	usedVolume: number;
	requiredVolume: number;
	bloodType: BloodType;
	bloodTypeComponent: string;
	status: string;
	description: string;
	rejectionReason: string | null;
	startDate: string;
	endDate: string;
	wardCode: string;
	districtCode: string;
	provinceCode: string;
	wardName: string;
	districtName: string;
	provinceName: string;
	longitude: string;
	latitude: string;
}

export interface EmergencyRequestLog {
	id: string;
	createdAt: string;
	updatedAt: string;
	emergencyRequest: EmergencyRequest;
	staff: Staff | null;
	account: Account | null;
	status: string;
	note: string;
	previousValue: string;
	newValue: string;
}

export interface EmergencyRequestLogResponse {
	success: boolean;
	message: string;
	data: {
		data: EmergencyRequestLog[];
		meta: PaginationMeta;
	};
}

export interface EmergencyRequestLogByIdResponse {
	success: boolean;
	message: string;
	data: EmergencyRequestLog;
}

export interface EmergencyRequestByIdResponse {
	success: boolean;
	message: string;
	data: EmergencyRequest;
}

export interface EmergencyRequestResponse {
	success: boolean;
	message: string;
	data: {
		data: EmergencyRequest[];
		meta: PaginationMeta;
	};
}

// Payload Interfaces
export interface ApproveEmergencyRequestPayload {
	bloodUnitId: string;
	usedVolume: number;
}

export interface RejectEmergencyRequestPayload {
	rejectionReason: string;
}

export interface RejectAllEmergencyRequestsPayload {
	bloodGroup?: string;
	bloodRh?: string;
	bloodTypeComponent?: string;
	rejectionReason: string;
}

// GET
export interface GetAllEmergencyRequestsParams {
	page?: number;
	limit?: number;
	status?: EmergencyRequestStatus;
	bloodGroup?: BloodGroup;
	bloodRh?: BloodRh;
	bloodTypeComponent?: BloodComponentTypeOnly;
	requestedByRole?: AccountUserRole;
}

// PATCH
export interface SuggestedContacts {
	id: string;
	firstName: string;
	lastName: string;
	phone: string;
	bloodType: BloodType;
}

export interface ProvideContactsBody {
	suggestedContacts: SuggestedContacts[];
}
