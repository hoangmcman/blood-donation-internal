import { BloodComponentType, BloodGroup, BloodType } from "./blood";
import { PaginationMeta } from "./pagination";

export interface InventoryMember {
	id: string;
	firstName: string;
	lastName: string;
	bloodType: BloodType | null;
	phone: string;
}

export interface BloodUnit {
  id: string;
  createdAt: string;
  updatedAt: string;
  member: InventoryMember;
  bloodType: BloodType;
  bloodVolume: number;
  remainingVolume: number;
  bloodComponentType: string; // e.g., "whole_blood", "red_cells", "plasma", "platelets"
  isSeparated: boolean;
  parentWholeBlood?: string; // ID of the parent whole blood unit if this is a separated
  expiredDate: string;
  status: string;
}

export interface BloodUnitResponse {
  success: boolean;
  message: string;
  data: {
    data: BloodUnit[];
    meta: PaginationMeta;
  };
}

export interface CreateBloodUnitPayload {
  memberId: string;
  bloodGroup: string;
  bloodRh: string;
  bloodVolume: number;
  remainingVolume: number;
  expiredDate: string;
  donationRequestId: string;
}

// BloodUnitAction Interfaces
export interface BloodUnitAction {
  id: string;
  bloodUnit: BloodUnit;
  staff: {
    id: string;
    createdAt: string;
    updatedAt: string;
    account: string;
    firstName: string;
    lastName: string;
    role: string;
  };
  action: string;
  description: string;
  previousValue: string;
  newValue: string;
  createdAt: string;
  updatedAt: string;
}

export interface BloodUnitActionResponse {
  data: {
    data: BloodUnitAction[];
    meta: PaginationMeta;
  };
}

export interface CreateBloodUnitActionPayload {
  bloodUnitId: string;
  staffId: string;
  action: string;
  description: string;
  previousValue: string;
  newValue: string;
}

// New Interface for Separated Blood Components
export interface SeparatedBloodUnit {
  id: string;
  member: InventoryMember;
  bloodType: BloodType;
  bloodVolume: number;
  bloodComponentType: string;
  remainingVolume: number;
  isSeparated: boolean;
  parentWholeBlood: string;
  expiredDate: string;
  status: string;
  createdAt: string;
  updatedAt: string;
}

export interface SeparateComponentsPayload {
  wholeBloodUnitId: string;
  redCellsVolume: number;
  redCellsExpiredDate: string; // Ngày hết hạn riêng cho hồng cầu
  plasmaVolume: number;
  plasmaExpiredDate: string; // Ngày hết hạn riêng cho huyết tương
  plateletsVolume: number;
  plateletsExpiredDate: string; // Ngày hết hạn riêng cho tiểu cầu
  staffId: string; // ID của nhân viên thực hiện tách máu
}

export interface SeparateComponentsResponse {
  wholeBloodUnit: SeparatedBloodUnit;
  redCellsUnit: SeparatedBloodUnit;
  plasmaUnit: SeparatedBloodUnit;
  plateletsUnit: SeparatedBloodUnit;
}

export enum BloodUnitStatus {
  AVAILABLE = "available",
  USED = "used",
  EXPIRED = "expired",
  DAMAGED = "damaged",
}

// GET
export interface GetAllBloodUnitsParams {
  page?: number;
  limit?: number;
  bloodType?: BloodGroup;
  status?: BloodUnitStatus;
  expired?: boolean;
  bloodComponentType?: BloodComponentType;
}