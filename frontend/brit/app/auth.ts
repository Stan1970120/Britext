import NextAuth from "next-auth";
import GoogleProvider from "next-auth/providers/google";

export const { handlers, signIn, signOut, auth } = NextAuth({
    providers: [
        GoogleProvider({
            clientId: process.env.AUTH_GOOGLE_ID || process.env.GOOGLE_CLIENT_ID || "",
            clientSecret: process.env.AUTH_GOOGLE_SECRET || process.env.GOOGLE_CLIENT_SECRET || "",
        }),
    ],
    callbacks: {
        async jwt({ token, user, account }) {
            // account and user are ONLY present on the initial sign-in trigger
            if (account && user) {
                token.accessToken = account.access_token;

                if (account.provider === "google") {
                    try {
                        const rawApiBase = process.env.NEXT_PUBLIC_REST_API || "";
                        if (!rawApiBase) {
                            console.error("OAuth Error: NEXT_PUBLIC_REST_API is undefined.");
                            return token;
                        }

                        const apiBase = rawApiBase.replace(/\/+$/, "");
                        const syncEndpoint = apiBase.endsWith("/api")
                            ? `${apiBase}/auth/google-sync`
                            : `${apiBase}/api/auth/google-sync`;

                        const res = await fetch(syncEndpoint, {
                            method: "POST",
                            headers: { "Content-Type": "application/json" },
                            body: JSON.stringify({
                                email: user.email,
                                firstName: user.name?.split(" ")[0] || "Google",
                                lastName: user.name?.split(" ").slice(1).join(" ") || "User",
                                image: user.image,
                                provider: "google",
                            }),
                        });

                        if (res.ok) {
                            const data = (await res.json()) as { token?: string };
                            if (data?.token) {
                                token.backendToken = String(data.token);
                            }
                        }
                    } catch (error) {
                        console.error("Backend OAuth Sync Exception:", error);
                    }
                }
            }
            return token;
        },
        async session({ session, token }) {
            if (typeof token.backendToken === "string") {
                session.backendToken = token.backendToken;
            }
            return session;
        },
    },
});