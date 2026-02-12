import jwt from "jsonwebtoken";
import {TOKEN_SETTINGS} from "./constants.ts";

export function decodeJwt(accessToken: string) {
    return jwt.verify(
        accessToken,
        TOKEN_SETTINGS.ACCESS.SECRET
    ) as { id: number };
}