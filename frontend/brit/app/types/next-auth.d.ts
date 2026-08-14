// Britext/frontend/brit/app/types/next-auth.d.ts

import "next-auth";
import "next-auth/jwt";

declare module "next-auth" {
    interface User {
        backendToken?: string;
    }
    interface Session {
        backendToken?: string;
    }
}

declare module "next-auth/jwt" {
    interface JWT {
        backendToken?: string;
        accessToken?: string;
    }
}