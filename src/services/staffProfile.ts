import api from "@/config/api"; // axios instance đã cấu hình sẵn

export interface StaffProfile {
  firstName: string;
  lastName: string;
  role: string;
}

interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
}

export const StaffProfileService = {
  getProfile: async (): Promise<StaffProfile> => {
    try {
      const response = await api.get<ApiResponse<StaffProfile>>('/staffs/me');
      if (response.data.success) {
        return response.data.data;
      }
      throw new Error(response.data.message || 'Failed to fetch profile');
    } catch (error) {
      console.error('Error fetching profile:', error);
      throw error;
    }
  },

  updateProfile: async (profile: Partial<StaffProfile>): Promise<void> => {
    try {
      const response = await api.patch<ApiResponse<StaffProfile>>('/staffs/me', profile);
      if (!response.data.success) {
        throw new Error(response.data.message || 'Failed to update profile');
      }
    } catch (error) {
      console.error('Error updating profile:', error);
      throw error;
    }
  }
};