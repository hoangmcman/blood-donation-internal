"use client"

import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Textarea } from "@/components/ui/textarea"
import { toast } from "sonner"
import { useRejectAllEmergencyRequests } from "../../services/emergencyrequest"
import { useGetEmergencyRequestLogs } from "../../services/emergencyrequest"
import { useEffect } from "react"

const formSchema = z.object({
    bloodGroup: z.string().optional(),
    bloodRh: z.string().optional(),
    bloodTypeComponent: z.string().optional(),
    reason: z.string().min(1, { message: "Lý do là bắt buộc" }),
})

interface RejectAllEmergencyRequestsDialogProps {
    open: boolean
    onOpenChange: (open: boolean) => void
    bloodGroups: string[]
    bloodRhs: string[]
    bloodTypeComponents: string[]
}

export function RejectAllEmergencyRequestsDialog({ open, onOpenChange, bloodGroups, bloodRhs, bloodTypeComponents }: RejectAllEmergencyRequestsDialogProps) {
    const { mutate } = useRejectAllEmergencyRequests()
    const { data } = useGetEmergencyRequestLogs(1, 1000) // Fetch all data for filtering options

    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            bloodGroup: "",
            bloodRh: "",
            bloodTypeComponent: "",
            reason: "",
        },
    })

    useEffect(() => {
        if (data?.data.data) {
            form.reset({
                bloodGroup: "",
                bloodRh: "",
                bloodTypeComponent: "",
                reason: "",
            })
        }
    }, [data, form])

    const handleRejectAll = (values: z.infer<typeof formSchema>) => {
        mutate(
            {
                bloodGroup: values.bloodGroup,
                bloodRh: values.bloodRh,
                bloodTypeComponent: values.bloodTypeComponent,
                rejectionReason: values.reason,
            },
            {
                onSuccess: () => {
                    toast.success("Từ chối tất cả yêu cầu thành công");
                    onOpenChange(false);
                },
                onError: () => {
                    toast.error("Từ chối tất cả yêu cầu thất bại");
                },
            }
        );
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>Từ chối tất cả yêu cầu khẩn cấp</DialogTitle>
                </DialogHeader>
                <Form {...form}>
                    <form onSubmit={form.handleSubmit(handleRejectAll)} className="space-y-4">
                        <FormField
                            control={form.control}
                            name="bloodGroup"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Nhóm máu</FormLabel>
                                    <FormControl>
                                        <select {...field} className="w-full p-2 border rounded">
                                            <option value="">Tất cả</option>
                                            {bloodGroups.map((group) => (
                                                <option key={group} value={group}>{group}</option>
                                            ))}
                                        </select>
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <FormField
                            control={form.control}
                            name="bloodRh"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Rh</FormLabel>
                                    <FormControl>
                                        <select {...field} className="w-full p-2 border rounded">
                                            <option value="">Tất cả</option>
                                            {bloodRhs.map((rh) => (
                                                <option key={rh} value={rh}>{rh}</option>
                                            ))}
                                        </select>
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <FormField
                            control={form.control}
                            name="bloodTypeComponent"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Thành phần máu</FormLabel>
                                    <FormControl>
                                        <select {...field} className="w-full p-2 border rounded">
                                            <option value="">Tất cả</option>
                                            {bloodTypeComponents.map((component) => (
                                                <option key={component} value={component}>{component}</option>
                                            ))}
                                        </select>
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <FormField
                            control={form.control}
                            name="reason"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Lý do từ chối</FormLabel>
                                    <FormControl>
                                        <Textarea {...field} placeholder="Nhập lý do từ chối" />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <Button type="submit">Từ chối tất cả</Button>
                    </form>
                </Form>
            </DialogContent>
        </Dialog>
    )
}