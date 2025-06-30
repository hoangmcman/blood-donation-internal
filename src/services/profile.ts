import api from "@/config/api"; // axios instance đã cấu hình sẵn

export interface AdminProfile {
  firstName: string;
  lastName: string;
  role: string;
}

interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
}

export const ProfileService = {
  getProfile: async (): Promise<AdminProfile> => {
    try {
      const response = await api.get<ApiResponse<AdminProfile>>('/admins/me');
      if (response.data.success) {
        return response.data.data;
      }
      throw new Error(response.data.message || 'Failed to fetch profile');
    } catch (error) {
      console.error('Error fetching profile:', error);
      throw error;
    }
  },

  updateProfile: async (profile: Partial<AdminProfile>): Promise<void> => {
    try {
      const response = await api.patch<ApiResponse<AdminProfile>>('/admins/me', profile);
      if (!response.data.success) {
        throw new Error(response.data.message || 'Failed to update profile');
      }
    } catch (error) {
      console.error('Error updating profile:', error);
      throw error;
    }
  }
};