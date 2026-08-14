async signIn({ user, account }) {
    if (account?.provider === "google") {
        try {
            const apiBase = process.env.NEXT_PUBLIC_REST_API;

            if (!apiBase) {
                console.error("OAuth Sync Error: NEXT_PUBLIC_REST_API is not set.");
                return false;
            }

            // Strips trailing slashes to prevent url malformation
            const cleanApiBase = apiBase.replace(/\/+$/, "");
            const targetUrl = `${cleanApiBase}/auth/google-sync`;

            console.log("Sending OAuth sync to:", targetUrl);

            const res = await fetch(targetUrl, {
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

            if (!res.ok) {
                const errorText = await res.text();
                console.error(`Backend returned status ${res.status} from ${targetUrl}:`, errorText);
                return false;
            }

            const data = await res.json();
            if (data?.token) {
                (user as User).backendToken = String(data.token);
            }

            return true;
        } catch (error) {
            console.error("Backend OAuth Sync Runtime Exception:", error);
            return false;
        }
    }
    return true;
}