// --------------------
// Types
// --------------------

export interface RegisterPayload {
    firstName: string,
    lastName: string,
    email: string
    password: string,
    sex: string
}

export interface LoginPayload {
    email: string;
    password: string;
}

export interface User {
    user_id: string;
    first_name: string;
    email: string;
    role: "student" | "admin";
}

export interface AuthResponse {
    user: User;
    emailVerification: {
        status: string
    }
    message?: string;
}

export interface AuthSignInResponse {
    "user_id": string | number
    "first_name": string
    "last_name": string
    "sex": string
    "email": string
    "role": string
    "date_created": string | Date
    err: string
}



// Error shape for axios-like errors
export interface AxiosErrorResponse {
    response?: {
        data?: {
            message?: string;
        };
    };
    message?: string;
}