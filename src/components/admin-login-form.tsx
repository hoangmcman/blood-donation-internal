"use client";

import type React from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import api from "@/config/api";
import { cn } from "@/lib/utils";
import { useSignIn, useUser } from "@clerk/clerk-react";

interface AdminLoginFormProps extends React.ComponentPropsWithoutRef<"form"> {
	onSwitchToSignup?: () => void;
}

export function AdminLoginForm({ className, onSwitchToSignup, ...props }: AdminLoginFormProps) {
	const { isLoaded, signIn, setActive } = useSignIn();
	useUser();
	const navigate = useNavigate();

	const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
		e.preventDefault();
		if (!isLoaded) {
			toast.error("Dịch vụ xác thực chưa sẵn sàng. Vui lòng thử lại sau.");
			return;
		}

		const formData = new FormData(e.currentTarget);
		const email = formData.get("email") as string;
		const password = formData.get("password") as string;

		try {
			const signInAttempt = await signIn.create({
				identifier: email,
				password,
			});

			if (signInAttempt.status === "complete") {
				await setActive({ session: signInAttempt.createdSessionId });
				toast.success("Đăng nhập thành công! Đang chuyển hướng...");

				// Đợi một chút để đảm bảo dữ liệu người dùng được tải
				setTimeout(async () => {
					try {
						const res = await api.get("/staffs/me");
						const role = res.data?.data?.role;

						if (role === "admin") {
							navigate("/admin");
						} else {
							console.error("Vai trò không phù hợp với đăng nhập admin:", role);
							toast.error("Tài khoản này không có quyền truy cập admin. Vui lòng kiểm tra lại.");
							// Có thể redirect về trang chủ hoặc đăng xuất
							navigate("/");
						}
					} catch (error) {
						console.error("Không thể lấy vai trò người dùng:", error);
						toast.error("Không thể xác thực vai trò người dùng. Vui lòng thử lại.");
						navigate("/");
					}
				}, 100);
			} else {
				console.error("Đăng nhập thất bại:", signInAttempt);
				toast.error("Đăng nhập thất bại. Vui lòng kiểm tra thông tin đăng nhập.");
			}
		} catch (err) {
			console.error("Lỗi trong quá trình đăng nhập:", err);
			toast.error("Đã xảy ra lỗi trong quá trình đăng nhập. Vui lòng thử lại.");
		}
	};

	return (
		<form className={cn("flex flex-col gap-6", className)} onSubmit={handleSubmit} {...props}>
			<div className="flex flex-col items-center gap-2 text-center">
				<h1 className="text-2xl font-bold">Đăng nhập Quản trị viên</h1>
				<p className="text-gray-600">Truy cập hệ thống với quyền quản trị</p>
			</div>
			<div className="grid gap-6">
				<div className="grid gap-2">
					<Label htmlFor="email">Email</Label>
					<Input
						id="email"
						name="email"
						type="email"
						placeholder="admin@bloodlink.com"
						required
						className="border-gray-300 focus:border-blue-600"
					/>
				</div>
				<div className="grid gap-2">
					<div className="flex items-center">
						<Label htmlFor="password">Mật khẩu</Label>
					</div>
					<Input
						id="password"
						name="password"
						type="password"
						required
						className="border-gray-300 focus:border-blue-600"
					/>
				</div>
				<Button type="submit" className="w-full bg-blue-600 hover:bg-blue-700" disabled={!isLoaded}>
					Đăng nhập
				</Button>
				<Button
					type="button"
					variant="outline"
					className="w-full"
					disabled={!isLoaded}
					onClick={() => navigate("/")}
				>
					Quay lại trang chủ
				</Button>
			</div>
		</form>
	);
}
