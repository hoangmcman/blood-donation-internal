import api from "@/config/api"; // axios instance đã cấu hình sẵn

export interface StaffProfile {
  id: string; // Thêm id
  firstName: string;
  lastName: string;
  role: string;
  account: {
    id: string; // ID của account
    createdAt: string;
    updatedAt: string;
    email: string;
    role: string;
  };
	avatar?: string;
}

interface ApiResponse<T> {
	success: boolean;
	message: string;
	data: T;
}

export const StaffProfileService = {
	getProfile: async (): Promise<StaffProfile> => {
		try {
			const response = await api.get<ApiResponse<StaffProfile>>("/staffs/me");
			if (response.data.success) {
				return response.data.data;
			}
			throw new Error(response.data.message || "Failed to fetch profile");
		} catch (error) {
			console.error("Error fetching profile:", error);
			throw error;
		}
	},

	updateProfile: async (profile: Partial<StaffProfile>): Promise<StaffProfile> => {
		try {
			const response = await api.patch<ApiResponse<StaffProfile>>("/staffs/me", profile);
			if (response.data.success) {
				return response.data.data;
			}
			throw new Error(response.data.message || "Failed to update profile");
		} catch (error) {
			console.error("Error updating profile:", error);
			throw error;
		}
	},

	uploadAvatar: async (avatar: File): Promise<StaffProfile> => {
		const formData = new FormData();
		formData.append("avatar", avatar);

		try {
			const response = await api.post<ApiResponse<StaffProfile>>("/staffs/avatar", formData, {
				headers: {
					"Content-Type": "multipart/form-data",
				},
			});
			if (response.data.success) {
				return response.data.data;
			}
			throw new Error(response.data.message || "Failed to upload avatar");
		} catch (error) {
			console.error("Error uploading avatar:", error);
			throw error;
		}
	},
};
