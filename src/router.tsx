import { createBrowserRouter, Navigate } from 'react-router-dom'
import LoginPage from '@/pages/Login'
import { SignedOut, RedirectToSignIn, SignedIn } from "@clerk/clerk-react"

import AdminLayout from './layouts/AdminLayout'
import Dashboard from '@/pages/admin/Dashboard'
import CampaignList from './pages/admin/CampaignList'
import UserList from './pages/admin/UserList'
import AdminProfile from './pages/admin/AdminProfile'

import StaffLayout from './layouts/StaffLayout'
import Donation from '@/pages/doctor/Donation'
import BloodUnitManagement from '@/pages/doctor/BloodUnitManagement'
import StaffCampaignList from '@/pages/doctor/StaffCampaignList'
import StaffProfile from './pages/doctor/StaffProfile'
import BloodUnitHistory from './pages/doctor/BloodUnitHistory'
import DonationRequestList from './pages/doctor/DonationRequestList'

import BlogList from '@/pages/staff/BlogList'
import EmergencyRequestList from '@/pages/staff/EmergencyRequestList'
import DonationResultTemplateList from './pages/staff/DonationResultTemplateList'
import StaffDonationResultList from './pages/doctor/StaffDonationResultList'

export const router = createBrowserRouter([
  {
    path: '/',
    element: <Navigate to="/admin" replace />
  },
  {
    path: '/admin',
    element: (
      <>
        <SignedIn>
          <AdminLayout />
        </SignedIn>
        <SignedOut>
          <Navigate to="/login" replace />
        </SignedOut>
      </>
    ),
    children: [
      {
        index: true,
        element: <Dashboard />
      },
      {
        path: 'campaign',
        element: <CampaignList />
      },
      {
        path: 'userlist',
        element: <UserList />
      },
      {
        path: 'adminprofile',
        element: <AdminProfile />
      },
    ]
  },
  {
    path: '/staff',
    element: (
      <>
        <SignedIn>
          <StaffLayout />
        </SignedIn>
        <SignedOut>
          <RedirectToSignIn />
        </SignedOut>
      </>
    ),
    children: [
      {
        index: true,
        element: <StaffCampaignList />
      },
      {
        path: 'donation',
        element: <Donation />
      },
      {
        path: 'campaign/:id/donation-requests',
        element: <DonationRequestList />
      },
      {
        path: 'bloglist',
        element: <BlogList />
      },
      {
        path: 'bloodunitmanagement',
        element: <BloodUnitManagement />
      },
      {
        path: 'donationresulttemplate',
        element: <DonationResultTemplateList />
      },
      {
        path: 'donationresultlist',
        element: <StaffDonationResultList donationResultId={''} />
      },
      {
        path: 'bloodunithistory',
        element: <BloodUnitHistory />
      },
      {
        path: 'staffprofile',
        element: <StaffProfile />
      },
      {
        path: 'emergency-request',
        element: <EmergencyRequestList />
      },
    ]
  },
  {
    path: '/login',
    element: <LoginPage />
  }
])