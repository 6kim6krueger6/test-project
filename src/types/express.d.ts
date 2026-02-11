import { Request } from "express";

declare global {
    namespace Express {
        interface Request {
            cookies: {
                accessToken?: string;
                refreshToken?: string;
            }
        }
    }
}

export type RequestWithCookies<T> = Request & { cookies: T };