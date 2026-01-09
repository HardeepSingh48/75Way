import bcrypt from "bcrypt";
import crypto from "crypto";

export const hashPassword = (password: string) =>
    bcrypt.hash(password, 10);

export const comparePassword = (
    password: string,
    hash: string
) => bcrypt.compare(password, hash);


export const hashOtp = (otp: string): string => {
    return crypto.createHash("sha256").update(otp).digest("hex");
};
