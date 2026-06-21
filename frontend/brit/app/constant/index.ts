export const REST_API = (() => {
    // Get the base URL
    let url = process.env.NEXT_PUBLIC_REST_API || "https://api.enjoyreads.com";

    // Clean up trailing slashes
    url = url.replace(/\/$/, "");

    // Ensure it ends with /api (but don't double it)
    if (!url.endsWith("/api")) {
        url = `${url}/api`;
    }

    return url;
})();


