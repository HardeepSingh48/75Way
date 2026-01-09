import axios from 'axios';
import type { LoginRequest, SignupRequest, ChangePasswordRequest, ForgotPasswordRequest, ResetPasswordRequest, AuthResponse } from '../types/auth.types';

const API_URL = 'http://localhost:5000/auth';

const api = axios.create({
    baseURL: API_URL,
    withCredentials: true,
    headers: {
        'Content-Type': 'application/json',
    },
});

export const authService = {
    async signup(data: SignupRequest): Promise<AuthResponse> {
        const response = await api.post<AuthResponse>('/signup', data);
        return response.data;
    },

    async login(data: LoginRequest): Promise<AuthResponse> {
        const response = await api.post<AuthResponse>('/login', data);
        return response.data;
    },

    async logout(): Promise<AuthResponse> {
        const response = await api.post<AuthResponse>('/logout');
        return response.data;
    },

    async changePassword(data: ChangePasswordRequest): Promise<AuthResponse> {
        const response = await api.post<AuthResponse>('/change-password', data);
        return response.data;
    },

    async forgotPassword(data: ForgotPasswordRequest): Promise<AuthResponse> {
        const response = await api.post<AuthResponse>('/forgot-password', data);
        console.log('Forgot password response:', response.data);
        return response.data;
    },

    async resetPassword(data: ResetPasswordRequest): Promise<AuthResponse> {
        const response = await api.post<AuthResponse>('/reset-password', data);
        return response.data;
    },
};
