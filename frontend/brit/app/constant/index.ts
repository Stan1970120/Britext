export const REST_API = (() => {
    // 1. Get the base URL
    let url = process.env.NEXT_PUBLIC_REST_API || "https://api.enjoyreads.com";

    // 2. Clean up trailing slashes
    url = url.replace(/\/$/, "");

    // 3. Ensure it ends with /api (but don't double it)
    if (!url.endsWith("/api")) {
        url = `${url}/api`;
    }

    return url;
})();