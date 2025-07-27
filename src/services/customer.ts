import api from "@/config/api";
import { BloodGroup, BloodRh, BloodType } from "@/interfaces/blood";
import { useQuery } from "@tanstack/react-query";

export interface Customer {
	id: string;
	firstName: string;
	lastName: string;
	phone: string;
	bloodType: BloodType;
	latitude: string;
	longitude: string;
}

export interface CustomerFindByLocationBody {
	bloodGroup: BloodGroup;
	bloodRh: BloodRh;
	radius: number;
	latitude: string;
	longitude: string;
}

export interface CustomerFindByLocationResponse {
	success: boolean;
	message: string;
	data: {
		customers: Customer[];
		count: number;
	};
}

export const findCustomersByLocation = async (
	body: CustomerFindByLocationBody
): Promise<CustomerFindByLocationResponse> => {
	const response = await api.post<CustomerFindByLocationResponse>(
		"/customers/find-by-location",
		body
	);
	return response.data;
};

export const useFindCustomersByLocation = (
	body: CustomerFindByLocationBody,
	options?: { enabled?: boolean }
) => {
	return useQuery({
		queryKey: ["findCustomersByLocation", body],
		queryFn: () => findCustomersByLocation(body),
		enabled: options?.enabled ?? true,
	});
};
