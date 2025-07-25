import { toast } from "sonner";

import { StaffProfile, StaffProfileService } from "@/services/staffProfile";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

export const STAFF_PROFILE_QUERY_KEY = "staff-profile";

// Query for getting staff profile
export const useStaffProfile = () => {
	return useQuery({
		queryKey: [STAFF_PROFILE_QUERY_KEY],
		queryFn: StaffProfileService.getProfile,
		staleTime: 5 * 60 * 1000, // 5 minutes
		retry: 1,
	});
};

// Mutation for updating staff profile
export const useUpdateStaffProfile = () => {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: (profile: Partial<StaffProfile>) => StaffProfileService.updateProfile(profile),
		onSuccess: (data) => {
			queryClient.setQueryData([STAFF_PROFILE_QUERY_KEY], data);
			queryClient.invalidateQueries({ queryKey: [STAFF_PROFILE_QUERY_KEY] });
			toast.success("Cập nhật hồ sơ thành công");
		},
		onError: (error: Error) => {
			console.error("Error updating profile:", error);
			toast.error("Cập nhật hồ sơ thất bại");
		},
	});
};

// Mutation for uploading avatar
export const useUploadAvatar = () => {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: (avatar: File) => StaffProfileService.uploadAvatar(avatar),
		onSuccess: (data) => {
			queryClient.setQueryData([STAFF_PROFILE_QUERY_KEY], data);
			queryClient.invalidateQueries({ queryKey: [STAFF_PROFILE_QUERY_KEY] });
			toast.success("Cập nhật ảnh đại diện thành công!");
		},
		onError: (error: Error) => {
			console.error("Error uploading avatar:", error);
			toast.error("Cập nhật ảnh đại diện thất bại. Vui lòng thử lại.");
		},
	});
};
