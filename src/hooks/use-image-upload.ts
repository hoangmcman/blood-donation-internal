import { useState } from "react";
import { useDropzone } from "react-dropzone";
import { toast } from "sonner";

import { useStaffProfile, useUploadAvatar } from "./use-staff-profile";

const useImageUpload = () => {
	const { data: profile } = useStaffProfile();
	const uploadAvatarMutation = useUploadAvatar();
	const [previewImage, setPreviewImage] = useState<string | null>(null);
	const [isUploading, setIsUploading] = useState(false);

	const onDrop = async (acceptedFiles: File[]) => {
		if (acceptedFiles.length === 0) return;

		const file = acceptedFiles[0];

		// Validate file type
		if (!file.type.startsWith("image/")) {
			toast.error("Vui lòng chọn một tệp hình ảnh");
			return;
		}

		// Validate file size (max 5MB)
		if (file.size > 5 * 1024 * 1024) {
			toast.error("Kích thước hình ảnh phải nhỏ hơn 5MB");
			return;
		}

		// Create preview
		const previewUrl = URL.createObjectURL(file);
		setPreviewImage(previewUrl);
		setIsUploading(true);

		try {
			await uploadAvatarMutation.mutateAsync(file);
		} catch (error) {
			console.error("Error uploading image:", error);
			setPreviewImage(null);
		} finally {
			setIsUploading(false);
		}
	};

	const { getRootProps, getInputProps, isDragActive } = useDropzone({
		onDrop,
		accept: {
			"image/*": [".png", ".jpg", ".jpeg", ".gif", ".webp"],
		},
		multiple: false,
		maxSize: 5 * 1024 * 1024, // 5MB
	});

	const resetPreview = () => {
		if (previewImage) {
			URL.revokeObjectURL(previewImage);
			setPreviewImage(null);
		}
	};

	return {
		getRootProps,
		getInputProps,
		isDragActive,
		isUploading: isUploading || uploadAvatarMutation.isPending,
		previewImage,
		resetPreview,
		currentImage: profile?.avatar,
	};
};

export default useImageUpload;
