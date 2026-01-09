export interface JwtPayload {
    id: string;
    sessionId: string;
}

export interface MFALoginResponse {
    mfaRequired: true;
}
export interface NormalLoginResponse {
    id: string;
    email: string;
}
export type LoginServiceResponse = MFALoginResponse | NormalLoginResponse;
