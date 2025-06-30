"use client";

import * as React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { toast } from "sonner";
import { User, Edit3, Save, X } from "lucide-react";
import { ProfileService } from "@/services/profile"; // đã đổi
import {
  Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Form, FormControl, FormField, FormItem, FormLabel, FormMessage
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";

const formSchema = z.object({
  firstName: z.string().min(1, "First name is required"),
  lastName: z.string().min(1, "Last name is required"),
});

type FormData = z.infer<typeof formSchema>;

export default function AdminProfile() {
  const [isEditing, setIsEditing] = React.useState(false);
  const [profile, setProfile] = React.useState<FormData | null>(null);
  const [loading, setLoading] = React.useState(true);

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      firstName: "",
      lastName: "",
    },
  });

  React.useEffect(() => {
    const fetchProfile = async () => {
      try {
        const data = await ProfileService.getProfile();
        setProfile(data);
        form.reset(data);
      } catch (error) {
        toast.error("Failed to fetch profile");
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, [form]);

  const onSubmit = async (data: FormData) => {
    try {
      await ProfileService.updateProfile(data);
      setProfile(data);
      setIsEditing(false);
      toast.success("Profile updated successfully");
    } catch (error) {
      toast.error("Failed to update profile");
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex justify-center items-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto mb-4"></div>
          <p className="text-gray-600 font-medium">Loading your profile...</p>
        </div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="min-h-screen flex justify-center items-center">
        <div className="text-center">
          <User className="h-16 w-16 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-600 font-medium">No profile data available</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-4 md:p-6">
      <div className="container mx-auto max-w-4xl">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-800 mb-2">Admin Profile</h1>
          <p className="text-gray-600">Manage your personal information</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-1">
            <Card className="h-fit border-gray-300 bg-white/80">
              <CardContent className="p-6 text-center">
                <div className="relative inline-block mb-4">
                  {profile.firstName && profile.lastName ? (
                    <div className="w-24 h-24 bg-red-500 rounded-full flex items-center justify-center text-white text-3xl font-bold shadow-lg">
                      {profile.firstName[0]}{profile.lastName[0]}
                    </div>
                  ) : (
                    <div className="w-24 h-24 bg-gray-300 rounded-full" />
                  )}
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
                      <CardTitle className="text-xl font-bold">Profile Information</CardTitle>
                      <CardDescription className="text-black/80">
                        {isEditing ? "Edit your details below" : "Your current profile information"}
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
                      Edit
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
                              First Name
                            </FormLabel>
                            <FormControl>
                              <Input
                                disabled={!isEditing}
                                className={`h-12 border-2 rounded-lg transition-all duration-200 ${isEditing
                                  ? 'border-gray-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 bg-white'
                                  : 'border-gray-100 bg-gray-50 text-gray-700'
                                  }`}
                                placeholder="Enter your first name"
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
                              Last Name
                            </FormLabel>
                            <FormControl>
                              <Input
                                disabled={!isEditing}
                                className={`h-12 border-2 rounded-lg transition-all duration-200 ${isEditing
                                  ? 'border-gray-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 bg-white'
                                  : 'border-gray-100 bg-gray-50 text-gray-700'
                                  }`}
                                placeholder="Enter your last name"
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
                        form.reset(profile);
                        setIsEditing(false);
                      }}
                      className="px-6 py-2 border-2 border-red-500 hover:bg-red-50 hover:border-red-600 transition-all duration-200 text-red-500"
                    >
                      <X className="w-4 h-4 mr-2" />
                      Cancel
                    </Button>
                    <Button
                      type="submit"
                      onClick={form.handleSubmit(onSubmit)}
                      className="px-6 py-2 bg-red-500 hover:bg-red-600 text-white shadow-lg hover:shadow-xl transition-all duration-200"
                    >
                      <Save className="w-4 h-4 mr-2" />
                      Save Changes
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
