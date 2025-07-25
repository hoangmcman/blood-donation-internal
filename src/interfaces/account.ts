import { ApiResponse } from "./base";

export enum AccountRole {
	Admin = "admin",
	Staff = "staff",
	User = "user",
}

export enum AccountUserRole {
	User = "user",
	Hospital = "hospital",
}

export enum StaffRole {
	Staff = "staff",
	Doctor = "doctor",
}

export interface Account {
	id: string;
	createdAt: string;
	updatedAt: string;
	email: string;
	role: AccountRole;
}

export interface Staff {
	id: string;
	createdAt: string;
	updatedAt: string;
	account: string;
	firstName: string;
	lastName: string;
	role: string;
}

export interface GetAdminProfileResponse {
	id: string;
	account: Account;
	firstName: string;
	lastName: string;
}

export interface GetStaffProfileResponse {
	id: string;
	account: Account;
	firstName: string;
	lastName: string;
	role: StaffRole;
}

export type GetAdminProfileResponseData = ApiResponse<GetAdminProfileResponse>;
export type GetStaffProfileResponseData = ApiResponse<GetStaffProfileResponse>;
