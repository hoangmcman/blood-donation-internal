"use client";

import type React from "react";
import { useSignIn, useUser } from "@clerk/clerk-react";
import { useNavigate } from "react-router-dom";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import api from "@/config/api";
import { toast } from "sonner";

interface LoginFormProps extends React.ComponentPropsWithoutRef<"form"> {
  onSwitchToSignup?: () => void;
}

export function LoginForm({ className, onSwitchToSignup, ...props }: LoginFormProps) {
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
            const res = await api.get('/staffs/me');
            const role = res.data?.data?.role;

            if (role === "admin") {
              navigate("/admin/dashboard");
            } else if (role === "doctor" || role === "staff") {
              navigate("/staff");
            } else {
              console.error("Vai trò không xác định từ API:", role);
              toast.error("Vai trò không xác định. Chuyển hướng về trang chủ.");
              navigate("/");
            }
          } catch (error) {
            console.error("Không thể lấy vai trò người dùng:", error);
            toast.error("Không thể lấy vai trò người dùng. Chuyển hướng về trang chủ.");
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
    <form
      className={cn("flex flex-col gap-6", className)}
      onSubmit={handleSubmit}
      {...props}
    >
      <div className="flex flex-col items-center gap-2 text-center">
        <h1 className="text-2xl font-bold">Đăng nhập vào BloodLink</h1>
      </div>
      <div className="grid gap-6">
        <div className="grid gap-2">
          <Label htmlFor="email">Email</Label>
          <Input
            id="email"
            name="email"
            type="email"
            placeholder="abc@gmail.com"
            required
            className="border-gray-300 focus:border-red-600"
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
            className="border-gray-300 focus:border-red-600"
          />
        </div>
        <Button type="submit" className="w-full bg-red-600 hover:bg-red-700" disabled={!isLoaded}>
          Đăng nhập
        </Button>
      </div>
    </form>
  );
}