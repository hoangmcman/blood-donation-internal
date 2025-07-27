"use client";

import { useMemo, useState } from "react";
import { toast } from "sonner";

import Loader from "@/components/loader";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Slider } from "@/components/ui/slider";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useDebounce } from "@/hooks/use-debounce";
import { BloodGroup, BloodRh } from "@/interfaces/blood";
import { useFindCustomersByLocation } from "@/services/customer";
import {
  useGetEmergencyRequestById,
  useProvideContactsForEmergencyRequest,
} from "@/services/emergencyrequest";
import {
  AdvancedMarker,
  APIProvider,
  Map,
  Pin,
} from "@vis.gl/react-google-maps";

interface ProvideContactsDialogProps {
	open: boolean;
	onOpenChange: (open: boolean) => void;
	requestId: string;
}

export function ProvideContactsDialog({
	open,
	onOpenChange,
	requestId,
}: ProvideContactsDialogProps) {
	const [selectedCustomerIds, setSelectedCustomerIds] = useState<string[]>([]);
	const [radius, setRadius] = useState<number>(10); // Default 10km
	const debouncedRadius = useDebounce(radius, 500); // Debounce 500ms

	// First get the emergency request to get the blood type parameters and location
	const {
		data: emergencyRequestData,
		isLoading: isEmergencyLoading,
		error: emergencyError,
	} = useGetEmergencyRequestById(requestId, { enabled: open });

	// Prepare parameters for finding customers by location
	const findCustomersParams = useMemo(() => {
		if (!emergencyRequestData?.data) return null;

		const { bloodType, latitude, longitude } = emergencyRequestData.data;

		return {
			bloodGroup: bloodType.group,
			bloodRh: bloodType.rh,
			radius: debouncedRadius, // Use debounced radius to avoid too many API calls
			latitude: latitude, // Keep as string
			longitude: longitude, // Keep as string
		};
	}, [emergencyRequestData, debouncedRadius]); // Use debouncedRadius in dependencies

	// Get customers by location
	const {
		data: customersData,
		isLoading: isCustomersLoading,
		error: customersError,
	} = useFindCustomersByLocation(findCustomersParams!, {
		enabled: open && !!findCustomersParams,
	});

	const { mutate: provideContacts, isPending } = useProvideContactsForEmergencyRequest();

	const isEmergencyDataLoading = isEmergencyLoading;
	const isCustomersDataLoading = isCustomersLoading;
	const error = emergencyError || customersError;

	// Get unique customers from the response
	const customers = customersData?.data?.customers || [];

	const handleCustomerSelect = (customer: any, checked: boolean) => {
		const customerId = customer.id;

		setSelectedCustomerIds((prev) => {
			if (checked) {
				return [...prev, customerId];
			} else {
				return prev.filter((id) => id !== customerId);
			}
		});
	};

	const handleSubmit = () => {
		if (selectedCustomerIds.length === 0) {
			toast.error("Vui lòng chọn ít nhất một liên hệ");
			return;
		}

		const selectedCustomers = customers.filter((customer) =>
			selectedCustomerIds.includes(customer.id)
		);

		const suggestedContacts = selectedCustomers.map((customer) => ({
			id: customer.id,
			firstName: customer.firstName,
			lastName: customer.lastName,
			phone: customer.phone,
			bloodType: customer.bloodType || { group: "O" as BloodGroup, rh: "+" as BloodRh },
		}));

		provideContacts(
			{
				id: requestId,
				body: { suggestedContacts },
			},
			{
				onSuccess: () => {
					toast.success("Đã cung cấp thông tin liên hệ thành công");
					onOpenChange(false);
					setSelectedCustomerIds([]);
					setRadius(10); // Reset radius to default
				},
				onError: (error: any) => {
					toast.error(`Lỗi: ${error.message || "Không thể cung cấp thông tin liên hệ"}`);
				},
			}
		);
	};

	const handleClose = () => {
		onOpenChange(false);
		setSelectedCustomerIds([]);
		setRadius(10); // Reset radius to default
	};

	if (isEmergencyDataLoading) {
		return (
			<Dialog open={open} onOpenChange={handleClose}>
				<DialogContent className="sm:max-w-[800px]">
					<DialogHeader>
						<DialogTitle>Cung cấp thông tin liên hệ</DialogTitle>
					</DialogHeader>
					<div className="flex items-center justify-center p-8">
						<Loader />
					</div>
				</DialogContent>
			</Dialog>
		);
	}

	if (error) {
		return (
			<Dialog open={open} onOpenChange={handleClose}>
				<DialogContent className="sm:max-w-[800px]">
					<DialogHeader>
						<DialogTitle>Cung cấp thông tin liên hệ</DialogTitle>
					</DialogHeader>
					<div className="p-4">
						<p className="text-red-600">Lỗi: {error.message || "Không thể tải dữ liệu"}</p>
					</div>
				</DialogContent>
			</Dialog>
		);
	}

	return (
		<Dialog open={open} onOpenChange={handleClose}>
			<DialogContent className="sm:max-w-[1200px] max-h-[90vh] overflow-y-auto">
				<DialogHeader>
					<DialogTitle>Cung cấp thông tin liên hệ cho yêu cầu khẩn cấp</DialogTitle>
				</DialogHeader>

				<div className="space-y-6">
					<p className="text-sm text-muted-foreground">
						Chọn những người hiến máu gần khu vực yêu cầu để cung cấp thông tin liên hệ cho yêu cầu
						khẩn cấp.
					</p>

					{/* Radius Selection */}
					<div className="space-y-3">
						<div className="flex items-center justify-between">
							<h3 className="text-lg font-semibold">Bán kính tìm kiếm</h3>
							<span className="text-sm font-medium bg-muted px-2 py-1 rounded">{radius} km</span>
						</div>
						<Slider
							value={[radius]}
							onValueChange={(value) => {
								setRadius(value[0]);
								// Reset selected customers when radius changes
								setSelectedCustomerIds([]);
							}}
							max={100}
							min={10}
							step={10}
							className="w-full"
						/>
						<div className="flex justify-between text-xs text-muted-foreground">
							<span>10 km</span>
							<span>100 km</span>
						</div>
					</div>

					{/* Google Maps Section */}
					{findCustomersParams && (
						<div className="space-y-2">
							<h3 className="text-lg font-semibold">Bản đồ vị trí người hiến máu</h3>
							<div className="w-full h-80 rounded-md border overflow-hidden">
								<APIProvider apiKey={import.meta.env.VITE_GOOGLE_MAPS_API_KEY}>
									<Map
										key={`map-${debouncedRadius}-${findCustomersParams.latitude}-${findCustomersParams.longitude}`}
										defaultCenter={{
											lat: parseFloat(findCustomersParams.latitude),
											lng: parseFloat(findCustomersParams.longitude),
										}}
										defaultZoom={12}
										mapId="provide-contacts-map"
									>
										{/* Emergency Request Location Marker */}
										<AdvancedMarker
											key="emergency-location"
											position={{
												lat: parseFloat(findCustomersParams.latitude),
												lng: parseFloat(findCustomersParams.longitude),
											}}
											title="Vị trí yêu cầu khẩn cấp"
										>
											<Pin
												background={"#dc2626"}
												borderColor={"#ffffff"}
												glyphColor={"#ffffff"}
												scale={1.4}
											>
												<div className="text-white text-xs font-bold">🚨</div>
											</Pin>
										</AdvancedMarker>

										{/* Customer Markers */}
										{customers.map((customer) => {
											const isSelected = selectedCustomerIds.includes(customer.id);
											return (
												<AdvancedMarker
													key={`customer-${customer.id}-${debouncedRadius}`}
													position={{
														lat: parseFloat(customer.latitude),
														lng: parseFloat(customer.longitude),
													}}
													title={`${customer.lastName} ${customer.firstName} - ${customer.phone}`}
												>
													<Pin
														background={isSelected ? "#16a34a" : "#3b82f6"}
														borderColor={"#ffffff"}
														glyphColor={"#ffffff"}
														scale={1.0}
													>
														<div className="text-white text-xs font-bold">
															{isSelected ? "✓" : "🩸"}
														</div>
													</Pin>
												</AdvancedMarker>
											);
										})}
									</Map>
								</APIProvider>
							</div>
							<p className="text-sm text-muted-foreground">
								� Vị trí yêu cầu khẩn cấp (đỏ) | 🩸 Người hiến máu (xanh) | ✓ Đã chọn (xanh lá) |
								Bán kính {radius}km
								{isCustomersDataLoading && " (Đang tải...)"}
							</p>
						</div>
					)}

					{/* Customers Table */}
					<div className="space-y-2">
						<h3 className="text-lg font-semibold">Danh sách người hiến máu</h3>
						{isCustomersDataLoading ? (
							<div className="flex items-center justify-center py-8">
								<Loader />
								<span className="ml-2 text-sm text-muted-foreground">
									Đang tìm người hiến máu...
								</span>
							</div>
						) : (
							<div className="rounded-md border">
								<Table>
									<TableHeader>
										<TableRow>
											<TableHead className="w-12">Chọn</TableHead>
											<TableHead>Tên người hiến</TableHead>
											<TableHead>Số điện thoại</TableHead>
											<TableHead>Nhóm máu</TableHead>
											<TableHead>Rh</TableHead>
										</TableRow>
									</TableHeader>
									<TableBody>
										{customers.length > 0 ? (
											customers.map((customer) => {
												const customerId = customer.id;
												const isSelected = selectedCustomerIds.includes(customerId);

												return (
													<TableRow key={customer.id} className={isSelected ? "bg-muted/50" : ""}>
														<TableCell>
															<Checkbox
																checked={isSelected}
																onCheckedChange={(checked) =>
																	handleCustomerSelect(customer, checked as boolean)
																}
															/>
														</TableCell>
														<TableCell className="font-medium">
															{customer.lastName} {customer.firstName}
														</TableCell>
														<TableCell>{customer.phone}</TableCell>
														<TableCell>
															<Badge variant="outline">{customer.bloodType?.group || "N/A"}</Badge>
														</TableCell>
														<TableCell>
															<Badge variant="outline">{customer.bloodType?.rh || "N/A"}</Badge>
														</TableCell>
													</TableRow>
												);
											})
										) : (
											<TableRow>
												<TableCell colSpan={5} className="h-24 text-center">
													Không tìm thấy người hiến máu nào trong khu vực.
												</TableCell>
											</TableRow>
										)}
									</TableBody>
								</Table>
							</div>
						)}
					</div>

					{selectedCustomerIds.length > 0 && (
						<div className="bg-muted/50 p-3 rounded-md">
							<p className="text-sm font-medium">
								Đã chọn {selectedCustomerIds.length} người hiến máu
							</p>
						</div>
					)}

					<div className="flex justify-end space-x-2 pt-4">
						<Button variant="outline" onClick={handleClose} disabled={isPending}>
							Hủy
						</Button>
						<Button onClick={handleSubmit} disabled={selectedCustomerIds.length === 0 || isPending}>
							{isPending ? "Đang xử lý..." : "Cung cấp thông tin liên hệ"}
						</Button>
					</div>
				</div>
			</DialogContent>
		</Dialog>
	);
}
