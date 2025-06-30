import { useAuth } from "@clerk/clerk-react";
import { createContext, useContext, useEffect } from "react";
import { setClerkTokenGetter } from "@/config/api";

interface AuthContextType {
    isAuthenticated: boolean;
    userId: string | null;
    getToken: () => Promise<string | null>;
}

const AuthContext = createContext<AuthContextType | null>(null);

export const useAuthContext = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuthContext must be used within an AuthProvider');
    }
    return context;
};

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
    const { getToken, isLoaded, isSignedIn, userId } = useAuth();

    useEffect(() => {
        if (!isLoaded) {
            console.log('Clerk auth is not loaded yet');
            return;
        }

        // Create a token getter function that includes the template
        const tokenGetter = async () => {
            try {
                console.log('Token getter called');
                const token = await getToken({ template: 'default' });
                console.log('Token obtained:', !!token);
                return token;
            } catch (error) {
                console.error('Error in token getter:', error);
                return null;
            }
        };

        // Set up the token getter for the API interceptor
        console.log('Setting up token getter in AuthProvider');
        setClerkTokenGetter(tokenGetter);

        // Test token retrieval
        tokenGetter().then(token => {
            console.log('Initial token test:', token ? 'Token received' : 'No token received');
        }).catch(error => {
            console.error('Error getting initial token:', error);
        });

        // Cleanup function
        return () => {
            console.log('Cleaning up AuthProvider');
            setClerkTokenGetter(() => Promise.resolve(null));
        };
    }, [getToken, isLoaded]);

    const value: AuthContextType = {
        isAuthenticated: !!isSignedIn,
        userId: userId || null,
        getToken: () => getToken({ template: 'default' })
    };

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    );
}; 