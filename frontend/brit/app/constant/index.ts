export const REST_API = (() => {
    let api = process.env.NEXT_PUBLIC_REST_API || "https://britext.onrender.com";

    // ✨ Auto-fix: Ensure it doesn't end with a slash, then add /api
    api = api.replace(/\/$/, "");

    if (!api.endsWith("/api")) {
        api = `${api}/api`;
    }

    return api;
})();