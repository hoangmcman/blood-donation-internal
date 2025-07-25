import { ApiResponse } from "@/interfaces/base";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import api from "../config/api";

interface BlogCreate {
	title: string;
	content: string;
	excerpt: string;
	imageUrl?: string;
	slug: string;
	tags: string[];
	status: "draft" | "published" | "archived";
	publishedAt?: string;
	createdAt?: string;
	updatedAt?: string;
}

export interface Blog {
	id: string;
	title: string;
	content: string;
	excerpt: string;
	imageUrl?: string;
	slug: string;
	tags: string[];
	status: "draft" | "published" | "archived";
	publishedAt?: string;
	createdAt?: string;
	updatedAt?: string;
}

interface BlogGetAllResponse {
	success: boolean;
	message: string;
	data: {
		data: Blog[];
		meta: {
			page: number;
			limit: number;
			total: number;
			totalPages: number;
			hasNextPage: boolean;
			hasPrevPage: boolean;
		};
	};
}

// Fetch all blogs
export const getBlogs = async ({
	page = 1,
	limit = 10,
	status,
	search,
	tags,
}: {
	page?: number;
	limit?: number;
	status?: string;
	search?: string;
	tags?: string[];
}): Promise<BlogGetAllResponse> => {
	const response = await api.get<BlogGetAllResponse>("/blog", {
		params: { page, limit, status, search, tags },
	});
	return response.data;
};

export const useGetBlogs = ({
	page = 1,
	limit = 10,
	status,
	search,
	tags,
}: {
	page?: number;
	limit?: number;
	status?: string;
	search?: string;
	tags?: string[];
}) => {
	return useQuery({
		queryKey: ["blogs", page, limit, status, search, tags],
		queryFn: () => getBlogs({ page, limit, status, search, tags }),
	});
};

// Fetch blog by ID
export const getBlogById = async (id: string): Promise<ApiResponse<Blog>> => {
	const response = await api.get<ApiResponse<Blog>>(`/blog/${id}`);
	return response.data;
};

export const useGetBlogById = (id: string) => {
	return useQuery({
		queryKey: ["blog", id],
		queryFn: () => getBlogById(id),
		enabled: !!id,
	});
};

// Create blog
export const createBlog = async (payload: BlogCreate): Promise<ApiResponse<Blog>> => {
	const response = await api.post<ApiResponse<Blog>>("/blog", payload);
	return response.data;
};

export const useCreateBlog = () => {
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: createBlog,
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ["blogs"] });
		},
	});
};

// Update blog
export const updateBlog = async (
	id: string,
	payload: Partial<BlogCreate>
): Promise<ApiResponse<Blog>> => {
	const response = await api.patch<ApiResponse<Blog>>(`/blog/${id}`, payload);
	return response.data;
};

export const useUpdateBlog = () => {
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: (variables: { id: string; payload: Partial<BlogCreate> }) =>
			updateBlog(variables.id, variables.payload),
		onSuccess: (_, variables) => {
			queryClient.invalidateQueries({ queryKey: ["blogs"] });
			queryClient.invalidateQueries({ queryKey: ["blog", variables.id] });
		},
	});
};

// Delete blog
export const deleteBlog = async (id: string): Promise<ApiResponse<void>> => {
	const response = await api.delete<ApiResponse<void>>(`/blog/${id}`);
	return response.data;
};

export const useDeleteBlog = () => {
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: deleteBlog,
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ["blogs"] });
		},
	});
};
