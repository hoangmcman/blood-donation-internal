"use client";

import { Users } from "lucide-react";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Toaster } from "sonner";

import { StaffLoginForm } from "@/components/staff-login-form";
import { useAuth } from "@clerk/clerk-react";

export default function StaffLoginPage() {
	const { isLoaded, isSignedIn } = useAuth();
	const navigate = useNavigate();
	const [shouldRender, setShouldRender] = useState(false);

	useEffect(() => {
		if (!isLoaded) return; // Chờ Clerk load xong

		if (isSignedIn) {
			navigate("/staff/campaign", { replace: true }); // Nếu đã đăng nhập thì redirect về staff dashboard
		} else {
			setShouldRender(true); // Cho phép render login page nếu chưa đăng nhập
		}
	}, [isLoaded, isSignedIn, navigate]);

	if (!shouldRender) return null;

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
			<div className="relative z-10 flex flex-col items-center gap-6 p-6 w-full max-w-md">
				{/* Logo and Branding */}
				<div className="flex items-center gap-2">
					<div className="flex h-10 w-10 items-center justify-center rounded-full bg-green-600 text-white">
						<Users className="h-6 w-6" />
					</div>
					<span className="text-2xl font-bold text-white">BloodLink Staff</span>
				</div>

				{/* Form Container */}
				<div className="w-full bg-white/90 backdrop-blur-md rounded-lg shadow-xl p-8">
					<StaffLoginForm onSwitchToSignup={() => {}} />
				</div>
			</div>
			<Toaster position="top-right" richColors />
		</div>
	);
}
