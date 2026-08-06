import NextAuth from "next-auth";
import GoogleProvider from "next-auth/providers/google";

const googleClientId = process.env.AUTH_GOOGLE_ID || process.env.GOOGLE_CLIENT_ID;
const googleClientSecret = process.env.AUTH_GOOGLE_SECRET || process.env.GOOGLE_CLIENT_SECRET;

if (!googleClientId || !googleClientSecret) {
    console.error("Missing Google OAuth environment variables. Check AUTH_GOOGLE_ID / GOOGLE_CLIENT_ID and AUTH_GOOGLE_SECRET / GOOGLE_CLIENT_SECRET.");
}

export const { handlers, signIn, signOut, auth } = NextAuth({
    providers: [
        GoogleProvider({
            clientId: googleClientId!,
            clientSecret: googleClientSecret!,
        }),
    ],
    callbacks: {
        async signIn({ user, account }) {
            if (account?.provider === "google") {
                try {
                    const res = await fetch(
                        `${process.env.NEXT_PUBLIC_REST_API}/auth/google-sync`,
                        {
                            method: "POST",
                            headers: { "Content-Type": "application/json" },
                            body: JSON.stringify({
                                email: user.email,
                                firstName: user.name?.split(" ")[0] || "",
                                lastName: user.name?.split(" ").slice(1).join(" ") || "",
                                image: user.image,
                                provider: "google",
                            }),
                        }
                    );
                    return res.ok;
                } catch (error) {
                    console.error("Backend OAuth Sync Error:", error);
                    return false;
                }
            }
            return true;
        },
        async jwt({ token, account }) {
            if (account) {
                token.accessToken = account.access_token;
            }
            return token;
        },
        async session({ session, token }) {
            return session;
        },
    },
});