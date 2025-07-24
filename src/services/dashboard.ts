import api from '../config/api';
import { useQuery } from '@tanstack/react-query';

// Dashboard Interfaces
export interface BloodTypeDistribution {
  bloodType: string;
  percentage: number;
}

export interface MonthlyTrend {
  month: string;
  donations: number;
}

export interface RecentCampaign {
  id: string;
  name: string;
  completedDonations: number;
  totalVolumeMl: number;
}

export interface OverallStats {
  totalDonations: number;
  completedDonations: number;
  pendingDonations: number;
  cancelledDonations: number;
  rejectedDonations: number;
  totalBloodVolume: number;
  averageBloodVolume: number;
  donationCompletionRate: number;
  uniqueDonors: number;
}

export interface BloodTypeStats {
  bloodTypes: Array<{
    bloodType: string;
    count: number;
    percentage: number;
    volumeMl: number;
  }>;
}

export interface MonthlyStats {
  months: Array<{
    month: string;
    totalDonations: number;
    completedDonations: number;
    totalVolumeMl: number;
  }>;
}

export interface CampaignStats {
  campaigns: Array<{
    id: string;
    name: string;
    totalDonations: number;
    completedDonations: number;
    totalVolumeMl: number;
    completionRate: number;
  }>;
}

export interface DonorStats {
  topDonors: Array<{
    donorId: string;
    firstName: string;
    lastName: string;
    donationCount: number;
    totalVolumeMl: number;
    lastDonationDate: string;
  }>;
  newDonors: number;
  returningDonors: number;
}

export interface Customer {
  id: string;
  createdAt: string;
  updatedAt: string;
  account: {
    id: string;
    createdAt: string;
    updatedAt: string;
    email: string;
    role: string;
  };
  bloodType?: {
    group: string;
    rh: string;
  };
  firstName: string;
  lastName: string;
  gender: string;
  dateOfBirth: string;
  phone: string;
  citizenId: string;
  longitude?: string;
  latitude?: string;
  wardCode?: string;
  districtCode?: string;
  provinceCode?: string;
  wardName?: string;
  districtName?: string;
  provinceName?: string;
  lastDonationDate?: string;
  status: string;
}

export interface PaginationMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
}

export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
}

// Dashboard Analytics API Operations
export const getDashboardSummary = async (startDate: string, endDate: string): Promise<ApiResponse<{
  totalDonations: number;
  completedDonations: number;
  totalBloodVolume: number;
  uniqueDonors: number;
  recentCampaigns: RecentCampaign[];
  bloodTypeDistribution: BloodTypeDistribution[];
  monthlyTrend: MonthlyTrend[];
}>> => {
  const response = await api.get<ApiResponse<{
    totalDonations: number;
    completedDonations: number;
    totalBloodVolume: number;
    uniqueDonors: number;
    recentCampaigns: RecentCampaign[];
    bloodTypeDistribution: BloodTypeDistribution[];
    monthlyTrend: MonthlyTrend[];
  }>>('/donation-stats/dashboard', {
    params: { startDate, endDate },
  });
  return response.data;
};

export const useGetDashboardSummary = (startDate: string, endDate: string) => {
  return useQuery({
    queryKey: ['dashboardSummary', startDate, endDate],
    queryFn: () => getDashboardSummary(startDate, endDate),
  });
};

export const getOverallStats = async (startDate: string, endDate: string): Promise<ApiResponse<OverallStats>> => {
  const response = await api.get<ApiResponse<OverallStats>>('/donation-stats/overall', {
    params: { startDate, endDate },
  });
  return response.data;
};

export const useGetOverallStats = (startDate: string, endDate: string) => {
  return useQuery({
    queryKey: ['overallStats', startDate, endDate],
    queryFn: () => getOverallStats(startDate, endDate),
  });
};

export const getBloodTypeDistribution = async (startDate: string, endDate: string): Promise<ApiResponse<BloodTypeStats>> => {
  const response = await api.get<ApiResponse<BloodTypeStats>>('/donation-stats/blood-types', {
    params: { startDate, endDate },
  });
  return response.data;
};

export const useGetBloodTypeDistribution = (startDate: string, endDate: string) => {
  return useQuery({
    queryKey: ['bloodTypeDistribution', startDate, endDate],
    queryFn: () => getBloodTypeDistribution(startDate, endDate),
  });
};

export const getMonthlyStats = async (startDate: string, endDate: string): Promise<ApiResponse<MonthlyStats>> => {
  const response = await api.get<ApiResponse<MonthlyStats>>('/donation-stats/monthly', {
    params: { startDate, endDate },
  });
  return response.data;
};

export const useGetMonthlyStats = (startDate: string, endDate: string) => {
  return useQuery({
    queryKey: ['monthlyStats', startDate, endDate],
    queryFn: () => getMonthlyStats(startDate, endDate),
  });
};

export const getCampaignStats = async (startDate: string, endDate: string): Promise<ApiResponse<CampaignStats>> => {
  const response = await api.get<ApiResponse<CampaignStats>>('/donation-stats/campaigns', {
    params: { startDate, endDate },
  });
  return response.data;
};

export const useGetCampaignStats = (startDate: string, endDate: string) => {
  return useQuery({
    queryKey: ['campaignStats', startDate, endDate],
    queryFn: () => getCampaignStats(startDate, endDate),
  });
};

export const getDonorStats = async (startDate: string, endDate: string): Promise<ApiResponse<DonorStats>> => {
  const response = await api.get<ApiResponse<DonorStats>>('/donation-stats/donors', {
    params: { startDate, endDate },
  });
  return response.data;
};

export const useGetDonorStats = (startDate: string, endDate: string) => {
  return useQuery({
    queryKey: ['donorStats', startDate, endDate],
    queryFn: () => getDonorStats(startDate, endDate),
  });
};

// New API Operations for Customers
export const getCustomerList = async (page: number, limit: number): Promise<ApiResponse<{
  customers: Customer[];
  total: number;
}>> => {
  const response = await api.get<ApiResponse<{
    customers: Customer[];
    total: number;
  }>>('/customers/list', {
    params: { page, limit },
  });
  return response.data;
};

export const useGetCustomerList = (page: number, limit: number) => {
  return useQuery({
    queryKey: ['customerList', page, limit],
    queryFn: () => getCustomerList(page, limit),
  });
};

export const getCustomerStats = async (): Promise<ApiResponse<{
  total: number;
  withBloodType: number;
  withLocation: number;
  nextThisMonth: number;
}>> => {
  const response = await api.get<ApiResponse<{
    total: number;
    withBloodType: number;
    withLocation: number;
    nextThisMonth: number;
  }>>('/customers/stats');
  return response.data;
};

export const useGetCustomerStats = () => {
  return useQuery({
    queryKey: ['customerStats'],
    queryFn: () => getCustomerStats(),
  });
};