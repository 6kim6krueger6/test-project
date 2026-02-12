import type {CookieOptions} from 'express';

export const IS_PRODUCTION = Bun.env.NODE_ENV === 'production';

export const COOKIE_NAMES = {
    ACCESS_TOKEN: 'accessToken',
    REFRESH_TOKEN: 'refreshToken',
} as const;

export const TOKEN_SETTINGS = {
    ACCESS: {
        SECRET: Bun.env.JWT_SECRET!,
        EXPIRES_IN_STRING: '10m',
        MAX_AGE_MS: 10 * 60 * 1000,
    },
    REFRESH: {
        MAX_AGE_MS: 30 * 24 * 60 * 60 * 1000,
    }
} as const;

export const BASE_COOKIE_OPTIONS: CookieOptions = {
    httpOnly: true,
    sameSite: 'strict',
    secure: IS_PRODUCTION,
    path: '/',
};
