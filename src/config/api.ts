import axios from "axios";
import { Mutex } from 'async-mutex';

declare global {
    interface Window {
        clerkGetToken?: () => Promise<string | null>;
    }
}

// Create a mutex for token operations
const tokenMutex = new Mutex();

const api = axios.create({
    baseURL: import.meta.env.VITE_API_URL,
    headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
    }
});

// Request interceptor to add Clerk session token to headers
api.interceptors.request.use(
    async (config) => {
        // Acquire mutex lock for token operations
        const release = await tokenMutex.acquire();
        
        try {
            // This will be set by the auth context
            const getToken = window.clerkGetToken;
            if (getToken) {
                const token = await getToken();
                console.log('Token:', token);
                if (token) {
                    // Ensure headers object exists
                    config.headers = config.headers || {};
                    config.headers.Authorization = `Bearer ${token}`;
                }
            }
            return config;
        } catch (error) {
            console.error('Error getting Clerk token:', error);
            return config;
        } finally {
            // Always release the mutex lock
            release();
        }
    },
    (error) => {
        return Promise.reject(error);
    }
);

// Response interceptor to handle auth errors
api.interceptors.response.use(
    (response) => {
        return response;
    },
    async (error) => {
        // Handle 401 (Unauthorized) errors - let Clerk handle session refresh
        if (error.response?.status === 401) {
            // Clerk will handle token refresh automatically
            console.error('Unauthorized request - Clerk session may have expired');
        }
        
        return Promise.reject(error);
    }
);

// Helper function to set the token getter from Clerk
export const setClerkTokenGetter = (getTokenFn: () => Promise<string | null>) => {
    window.clerkGetToken = getTokenFn;
};

export default api;