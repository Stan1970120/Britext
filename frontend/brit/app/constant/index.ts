// constants/index.ts
export const REST_API = (() => {
    const api = process.env.NEXT_PUBLIC_REST_API;

    if (!api) {
        console.warn("⚠️ NEXT_PUBLIC_REST_API is not defined. Using fallback.");
        return "https://britext.onrender.com";
    }

    return api;
})();
