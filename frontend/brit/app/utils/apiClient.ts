// brit/app/utils/apiClient.ts

/**
 * A type-safe wrapper around fetch that automatically injects 
 * the Auth token from localStorage.
 */
export const apiClient = async (url: string, options: RequestInit = {}) => {
    // 1. Grab the token safely from localStorage
    const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;

    // 2. Setup default headers using the standard Headers object
    const headers = new Headers(options.headers);

    if (!headers.has("Content-Type")) {
        headers.set("Content-Type", "application/json");
    }

    // 3. If token exists, add the Authorization header
    if (token) {
        headers.set("Authorization", `Bearer ${token}`);
    }

    // 4. Merge options with our injected headers and credentials
    const config: RequestInit = {
        ...options,
        headers,
        credentials: "include", // Essential for Render <-> Vercel cookie sync
    };

    try {
        const response = await fetch(url, config);

        // 5. Handle global errors (like 401 Unauthorized)
        if (response.status === 401) {
            console.error("Unauthorized! Session may have expired.");
            // You could trigger a logout or redirect here
        }

        return response;
    } catch (error) {
        console.error("Network or Fetch error:", error);
        throw error;
    }
};