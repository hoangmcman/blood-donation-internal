import { createBrowserRouter, Navigate } from "react-router-dom";

import Dashboard from "@/pages/admin/Dashboard";
import AdminLoginPage from "@/pages/AdminLogin";
import BloodUnitManagement from "@/pages/doctor/BloodUnitManagement";
import Donation from "@/pages/doctor/Donation";
import StaffCampaignList from "@/pages/doctor/StaffCampaignList";
import HomePage from "@/pages/Home";
import GeneralLoginPage from "@/pages/Login";
import BlogList from "@/pages/staff/BlogList";
import EmergencyRequestList from "@/pages/staff/EmergencyRequestList";
import StaffLoginPage from "@/pages/StaffLogin";
import { SignedIn, SignedOut } from "@clerk/clerk-react";

import AdminLayout from "./layouts/AdminLayout";
import StaffLayout from "./layouts/StaffLayout";
import AdminProfile from "./pages/admin/AdminProfile";
import CampaignList from "./pages/admin/CampaignList";
import UserList from "./pages/admin/UserList";
import BloodUnitHistory from "./pages/doctor/BloodUnitHistory";
import DonationRequestList from "./pages/doctor/DonationRequestList";
import StaffDonationResultList from "./pages/doctor/StaffDonationResultList";
import StaffProfile from "./pages/doctor/StaffProfile";
import DonationResultTemplateList from "./pages/staff/DonationResultTemplateList";

export const router = createBrowserRouter([
	{
		path: "/",
		element: <HomePage />,
	},
	{
		path: "/admin",
		element: (
			<>
				<SignedIn>
					<AdminLayout />
				</SignedIn>
				<SignedOut>
					<Navigate to="/admin/login" replace />
				</SignedOut>
			</>
		),
		children: [
			{
				index: true,
				element: <Dashboard />,
			},
			{
				path: "campaign",
				element: <CampaignList />,
			},
			{
				path: "userlist",
				element: <UserList />,
			},
			{
				path: "adminprofile",
				element: <AdminProfile />,
			},
		],
	},
	{
		path: "/staff",
		element: (
			<>
				<SignedIn>
					<StaffLayout />
				</SignedIn>
				<SignedOut>
					<Navigate to="/staff/login" replace />
				</SignedOut>
			</>
		),
		children: [
			{
				index: true,
				path: "campaign",
				element: <StaffCampaignList />,
			},
			{
				path: "donation",
				element: <Donation />,
			},
			{
				path: "campaign/:id/donation-requests",
				element: <DonationRequestList />,
			},
			{
				path: "bloglist",
				element: <BlogList />,
			},
			{
				path: "bloodunitmanagement",
				element: <BloodUnitManagement />,
			},
			{
				path: "donationresulttemplate",
				element: <DonationResultTemplateList />,
			},
			{
				path: "donationresultlist",
				element: <StaffDonationResultList donationResultId={""} />,
			},
			{
				path: "bloodunithistory",
				element: <BloodUnitHistory />,
			},
			{
				path: "staffprofile",
				element: <StaffProfile />,
			},
			{
				path: "emergency-request",
				element: <EmergencyRequestList />,
			},
		],
	},
	{
		path: "/login",
		element: <GeneralLoginPage />,
	},
	{
		path: "/admin/login",
		element: <AdminLoginPage />,
	},
	{
		path: "/staff/login",
		element: <StaffLoginPage />,
	},
]);
