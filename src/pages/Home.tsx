"use client";

import { HeartPlus, Shield, Users } from "lucide-react";
import { useNavigate } from "react-router-dom";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export default function HomePage() {
	const navigate = useNavigate();

	return (
		<div className="relative min-h-screen flex items-center justify-center">
			{/* Background Image with Blur */}
			<div className="absolute inset-0">
				<img
					src="https://media.istockphoto.com/id/1319068178/vector/medical-concept-people-make-blood-transfusion.jpg?s=612x612&w=0&k=20&c=fnkSiT9UVEg9YwGm3jcmkyiKctQMrBJPS-q2D9B8CMw="
					alt="Blood Donation Background"
					className="w-full h-full object-cover filter brightness-50"
				/>
				<div className="absolute inset-0" />
			</div>

			{/* Content */}
			<div className="relative z-10 flex flex-col items-center gap-8 p-6 w-full max-w-4xl">
				{/* Logo and Branding */}
				<div className="flex flex-col items-center gap-4 text-center">
					<div className="flex items-center gap-3">
						<div className="flex h-12 w-12 items-center justify-center rounded-full bg-red-600 text-white">
							<HeartPlus className="h-8 w-8" />
						</div>
						<span className="text-4xl font-bold text-white">BloodLink</span>
					</div>
					<p className="text-xl text-white/90 max-w-2xl">
						Hệ thống quản lý hiến máu nội bộ - Lựa chọn vai trò để đăng nhập
					</p>
				</div>

				{/* Login Options */}
				<div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full max-w-2xl">
					{/* Admin Login */}
					<Card className="bg-white/90 backdrop-blur-md hover:bg-white/95 transition-all duration-300 cursor-pointer transform hover:scale-105">
						<CardHeader className="text-center pb-4">
							<div className="flex justify-center mb-4">
								<div className="flex h-16 w-16 items-center justify-center rounded-full bg-blue-600 text-white">
									<Shield className="h-8 w-8" />
								</div>
							</div>
							<CardTitle className="text-2xl font-bold text-gray-800">Quản trị viên</CardTitle>
							<CardDescription className="text-gray-600">
								Truy cập hệ thống với quyền quản trị viên để quản lý toàn bộ hệ thống
							</CardDescription>
						</CardHeader>
						<CardContent>
							<Button
								onClick={() => navigate("/admin/login")}
								className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 text-lg font-semibold"
							>
								Truy cập Admin
							</Button>
						</CardContent>
					</Card>

					{/* Staff Login */}
					<Card className="bg-white/90 backdrop-blur-md hover:bg-white/95 transition-all duration-300 cursor-pointer transform hover:scale-105">
						<CardHeader className="text-center pb-4">
							<div className="flex justify-center mb-4">
								<div className="flex h-16 w-16 items-center justify-center rounded-full bg-green-600 text-white">
									<Users className="h-8 w-8" />
								</div>
							</div>
							<CardTitle className="text-2xl font-bold text-gray-800">Nhân viên</CardTitle>
							<CardDescription className="text-gray-600">
								Truy cập hệ thống với vai trò nhân viên để thực hiện các tác vụ hàng ngày
							</CardDescription>
						</CardHeader>
						<CardContent>
							<Button
								onClick={() => navigate("/staff/login")}
								className="w-full bg-green-600 hover:bg-green-700 text-white py-3 text-lg font-semibold"
							>
								Truy cập Nhân viên
							</Button>
						</CardContent>
					</Card>
				</div>

				{/* Footer */}
				<div className="text-center text-white/70 text-sm">
					<p>© 2025 BloodLink. Hệ thống quản lý hiến máu nội bộ.</p>
				</div>
			</div>
		</div>
	);
}
