# Image Upload Implementation with Tanstack Query

This implementation provides image upload functionality for staff profiles using Tanstack Query and react-dropzone.

## Files Created/Modified

### 1. Service Layer (`src/services/staffProfile.ts`)

- Updated `StaffProfile` interface to include `avatar?: string`
- Modified `updateProfile` to return the updated profile data
- Modified `uploadAvatar` to return the updated profile data

### 2. Tanstack Query Hooks (`src/hooks/use-staff-profile.ts`)

- `useStaffProfile()` - Query for fetching staff profile
- `useUpdateStaffProfile()` - Mutation for updating profile info
- `useUploadAvatar()` - Mutation for uploading avatar

### 3. Image Upload Hook (`src/hooks/use-image-upload.ts`)

- Handles drag & drop functionality
- File validation (type and size)
- Preview management
- Integrates with upload mutation

### 4. Image Uploader Component (`src/components/ui/profile-image-uploader.tsx`)

- Drag & drop interface
- Loading states
- Tooltip with instructions
- Avatar fallback with initials

### 5. Updated StaffProfile Page (`src/pages/doctor/StaffProfile.tsx`)

- Uses Tanstack Query hooks
- Integrated ProfileImageUploader component
- Proper loading and error states

## Features

### Image Upload

- ✅ Drag & drop support
- ✅ File type validation (images only)
- ✅ File size validation (max 5MB)
- ✅ Preview before upload
- ✅ Loading states
- ✅ Error handling with toast notifications
- ✅ Automatic cache invalidation after upload

### Profile Management

- ✅ Fetch profile data
- ✅ Update profile info
- ✅ Optimistic updates
- ✅ Cache management
- ✅ Loading states

## Usage

```tsx
import ProfileImageUploader from "@/components/ui/profile-image-uploader";

// In your component
<ProfileImageUploader userFullName={`${profile.firstName} ${profile.lastName}`} className="mb-4" />;
```

## Query Keys

The implementation uses consistent query keys for cache management:

- `"staff-profile"` - For staff profile data

## Cache Behavior

- **Stale Time**: 5 minutes
- **Auto Refetch**: Disabled on window focus
- **Invalidation**: Automatic after mutations
- **Optimistic Updates**: Profile data is immediately updated in cache

## Toast Notifications

Uses shadcn's sonner for notifications:

- Success messages for successful operations
- Error messages for failed operations
- Localized in Vietnamese

## File Validation

- **Accepted Types**: PNG, JPG, JPEG, GIF, WEBP
- **Max Size**: 5MB
- **Validation**: Both client-side and expected server-side

## Dependencies Added

- `react-dropzone` - For drag & drop functionality
- `@types/react-dropzone` - TypeScript support
