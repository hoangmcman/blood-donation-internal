import { createBrowserRouter, Navigate } from 'react-router-dom'
import LoginPage from '@/pages/Login' // Login page
import { SignedOut, RedirectToSignIn, SignedIn } from "@clerk/clerk-react"

import AdminLayout from './layouts/AdminLayout'
import Dashboard from '@/pages/admin/dashboard/Dashboard'
import CampaignList from './pages/admin/CampaignList'
import UserList from './pages/admin/UserList'
import BloodStock from './pages/admin/BloodStock'
import AdminProfile from './pages/admin/AdminProfile'

import StaffLayout from './layouts/StaffLayout'
import BlogList from '@/pages/staff/BlogList'
import Donation from '@/pages/staff/Donation'
import BloodUnitManagement from '@/pages/staff/BloodUnitManagement'
import StaffCampaignList from '@/pages/staff/StaffCampaignList'
import StaffProfile from './pages/staff/StaffProfile'
import BloodUnitHistory from './pages/staff/BloodUnitHistory'
import DonationRequestList from './pages/staff/DonationRequestList'

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
        path: 'bloodstock',
        element: <BloodStock />
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
        path: 'bloodunithistory',
        element: <BloodUnitHistory />
      },
      {
        path: 'staffprofile',
        element: <StaffProfile />
      },
    ]
  },
  {
    path: '/login',
    element: <LoginPage />
  }
])