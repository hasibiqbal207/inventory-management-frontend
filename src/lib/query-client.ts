import { QueryClient } from "@tanstack/react-query";

/**
 * Create a new QueryClient instance with default options
 */
export const queryClient = new QueryClient({
    defaultOptions: {
        queries: {
            staleTime: 60 * 1000, // 1 minute
            gcTime: 5 * 60 * 1000, // 5 minutes (formerly cacheTime)
            refetchOnWindowFocus: false,
            refetchOnReconnect: true,
            retry: 1,
        },
        mutations: {
            retry: 0,
        },
    },
});
