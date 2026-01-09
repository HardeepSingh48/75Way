export interface LoginRequest {
    email: string;
    password: string;
}

export interface SignupRequest {
    email: string;
    password: string;
}

export interface ChangePasswordRequest {
    oldPassword: string;
    newPassword: string;
}

export interface ForgotPasswordRequest {
    email: string;
}

export interface ResetPasswordRequest {
    email: string;
    resetToken: string;
    newPassword: string;
}

export interface AuthResponse {
    message: string;
    resetToken?: string;
}

export interface ErrorResponse {
    message: string;
    error?: string;
}

export interface User {
    id: string;
    email: string;
}
