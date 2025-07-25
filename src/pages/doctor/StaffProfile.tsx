"use client";

import { Edit3, Save, User, X } from "lucide-react";
import * as React from "react";
import { useForm } from "react-hook-form";
import * as z from "zod";

import { Button } from "@/components/ui/button";
import {
	Card,
	CardContent,
	CardDescription,
	CardFooter,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import {
	Form,
	FormControl,
	FormField,
	FormItem,
	FormLabel,
	FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import ProfileImageUploader from "@/components/ui/profile-image-uploader";
import { useStaffProfile, useUpdateStaffProfile } from "@/hooks/use-staff-profile";
import { zodResolver } from "@hookform/resolvers/zod";

const formSchema = z.object({
	firstName: z.string().min(1, "Tên là bắt buộc"),
	lastName: z.string().min(1, "Họ là bắt buộc"),
});

type FormData = z.infer<typeof formSchema>;

export default function StaffProfile() {
	const [isEditing, setIsEditing] = React.useState(false);
	const { data: profile, isLoading: loading } = useStaffProfile();
	const updateProfileMutation = useUpdateStaffProfile();

	const form = useForm<FormData>({
		resolver: zodResolver(formSchema),
		defaultValues: {
			firstName: "",
			lastName: "",
		},
	});

	React.useEffect(() => {
		if (profile) {
			form.reset({
				firstName: profile.firstName,
				lastName: profile.lastName,
			});
		}
	}, [profile, form]);

	const onSubmit = async (data: FormData) => {
		try {
			await updateProfileMutation.mutateAsync(data);
			setIsEditing(false);
		} catch (error) {
			// Error handling is done in the mutation
			console.error("Update failed:", error);
		}
	};

	if (loading) {
		return (
			<div className="min-h-screen flex justify-center items-center">
				<div className="text-center">
					<div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto mb-4"></div>
					<p className="text-gray-600 font-medium">Đang tải hồ sơ của bạn...</p>
				</div>
			</div>
		);
	}

	if (!profile) {
		return (
			<div className="min-h-screen flex justify-center items-center">
				<div className="text-center">
					<User className="h-16 w-16 text-gray-400 mx-auto mb-4" />
					<p className="text-gray-600 font-medium">Không có dữ liệu hồ sơ</p>
				</div>
			</div>
		);
	}

	return (
		<div className="min-h-screen p-4 md:p-6">
			<div className="container mx-auto max-w-4xl">
				<div className="text-center mb-8">
					<h1 className="text-4xl font-bold text-gray-800 mb-2">Hồ sơ nhân viên</h1>
					<p className="text-gray-600">Quản lý thông tin cá nhân của bạn</p>
				</div>

				<div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
					<div className="lg:col-span-1">
						<Card className="h-fit border-gray-300 bg-white/80">
							<CardContent className="p-6 text-center">
								<div className="relative inline-block mb-4">
									<ProfileImageUploader userFullName={`${profile.firstName} ${profile.lastName}`} />
								</div>
								<h3 className="text-xl font-semibold text-gray-800 mb-1">
									{profile.firstName} {profile.lastName}
								</h3>
							</CardContent>
						</Card>
					</div>

					<div className="lg:col-span-2">
						<Card className="border-gray-300 bg-white/80">
							<CardHeader className="text-black rounded-t-lg">
								<div className="flex items-center justify-between">
									<div className="flex items-center space-x-3">
										<User className="w-6 h-6" />
										<div>
											<CardTitle className="text-xl font-bold">Thông tin hồ sơ</CardTitle>
											<CardDescription className="text-black/80">
												{isEditing
													? "Chỉnh sửa thông tin của bạn bên dưới"
													: "Thông tin hồ sơ hiện tại của bạn"}
											</CardDescription>
										</div>
									</div>
									{!isEditing && (
										<Button
											variant="secondary"
											size="sm"
											onClick={() => setIsEditing(true)}
											className="bg-red-500 hover:bg-red-600 text-white border-white/30"
										>
											<Edit3 className="w-4 h-4 mr-2" />
											Chỉnh sửa
										</Button>
									)}
								</div>
							</CardHeader>

							<CardContent className="p-8">
								<Form {...form}>
									<div className="space-y-8">
										<div className="grid grid-cols-1 md:grid-cols-2 gap-6">
											<FormField
												control={form.control}
												name="firstName"
												render={({ field }) => (
													<FormItem>
														<FormLabel className="text-sm font-semibold text-gray-700 flex items-center">
															<User className="w-4 h-4 mr-2 text-indigo-500" />
															Tên
														</FormLabel>
														<FormControl>
															<Input
																disabled={!isEditing}
																className={`h-12 border-2 rounded-lg transition-all duration-200 ${
																	isEditing
																		? "border-gray-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 bg-white"
																		: "border-gray-100 bg-gray-50 text-gray-700"
																}`}
																placeholder="Nhập tên của bạn"
																{...field}
															/>
														</FormControl>
														<FormMessage className="text-red-500 text-sm" />
													</FormItem>
												)}
											/>

											<FormField
												control={form.control}
												name="lastName"
												render={({ field }) => (
													<FormItem>
														<FormLabel className="text-sm font-semibold text-gray-700 flex items-center">
															<User className="w-4 h-4 mr-2 text-indigo-500" />
															Họ
														</FormLabel>
														<FormControl>
															<Input
																disabled={!isEditing}
																className={`h-12 border-2 rounded-lg transition-all duration-200 ${
																	isEditing
																		? "border-gray-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 bg-white"
																		: "border-gray-100 bg-gray-50 text-gray-700"
																}`}
																placeholder="Nhập họ của bạn"
																{...field}
															/>
														</FormControl>
														<FormMessage className="text-red-500 text-sm" />
													</FormItem>
												)}
											/>
										</div>
									</div>
								</Form>
							</CardContent>

							{isEditing && (
								<CardFooter className="bg-gray-50/50 border-t border-gray-100 p-6 rounded-b-lg">
									<div className="flex justify-end space-x-4 w-full">
										<Button
											variant="outline"
											onClick={() => {
												if (profile) {
													form.reset({
														firstName: profile.firstName,
														lastName: profile.lastName,
													});
												}
												setIsEditing(false);
											}}
											className="px-6 py-2 border-2 border-red-500 hover:bg-red-50 hover:border-red-600 transition-all duration-200 text-red-500"
										>
											<X className="w-4 h-4 mr-2" />
											Hủy
										</Button>
										<Button
											type="submit"
											onClick={form.handleSubmit(onSubmit)}
											disabled={updateProfileMutation.isPending}
											className="px-6 py-2 bg-red-500 hover:bg-red-600 text-white shadow-lg hover:shadow-xl transition-all duration-200 disabled:opacity-50"
										>
											<Save className="w-4 h-4 mr-2" />
											{updateProfileMutation.isPending ? "Đang lưu..." : "Lưu thay đổi"}
										</Button>
									</div>
								</CardFooter>
							)}
						</Card>
					</div>
				</div>
			</div>
		</div>
	);
}
