import { randomUUID } from "crypto";

export const generateSessionId = (): string => {
    return randomUUID();
};
