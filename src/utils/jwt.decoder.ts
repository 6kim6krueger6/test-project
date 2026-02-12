import jwt from "jsonwebtoken";
import {TOKEN_SETTINGS} from "./constants.ts";

export type AccessTokenPayload = {
    id: number;
    sid: number;
};

export function decodeJwt(accessToken: string) {
    return jwt.verify(
        accessToken,
        TOKEN_SETTINGS.ACCESS.SECRET
    ) as AccessTokenPayload;
}
