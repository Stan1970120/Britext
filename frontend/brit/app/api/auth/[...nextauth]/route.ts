import NextAuth from "next-auth";
import GoogleProvider from "next-auth/providers/google";

export const { handlers, signIn, signOut, auth } = NextAuth({
    providers: [
        GoogleProvider({
            clientId: process.env.AUTH_GOOGLE_ID!,
            clientSecret: process.env.AUTH_GOOGLE_SECRET!,
        }),
    ],
    callbacks: {
        async signIn({ user, account }) {
            if (account?.provider === "google") {
                try {
                    // Sync Google user with Express MongoDB backend
                    const res = await fetch(`${process.env.NEXT_PUBLIC_REST_API}/auth/google-sync`, {
                        method: "POST",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({
                            email: user.email,
                            firstName: user.name?.split(" ")[0] || "",
                            lastName: user.name?.split(" ").slice(1).join(" ") || "",
                            image: user.image,
                            provider: "google",
                        }),
                    });
                    return res.ok;
                } catch (error) {
                    console.error("Backend OAuth Sync Error:", error);
                    return false;
                }
            }
            return true;
        },
        async jwt({ token, account, user }) {
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

export const { GET, POST } = handlers;