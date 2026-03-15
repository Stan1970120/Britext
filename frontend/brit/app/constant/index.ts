export const REST_API = (() => {
    let api = process.env.NEXT_PUBLIC_REST_API || "https://enjoyreads.com";

    // ✨ Auto-fix: Ensure it doesn't end with a slash, then add /api
    api = api.replace(/\/$/, "");

    if (!api.endsWith("/api")) {
        api = `${api}/api`;
    }

    return api;
})();

//"https://enjoyreads.com",     // Your main domain
//  "https://www.enjoyreads.com"