import jwt from 'jsonwebtoken';
import bcrypt from "bcryptjs";
import { randomBytes } from "crypto";
import {UserRepository, RefreshRepository} from "../repository";
import {TOKEN_SETTINGS} from "../utils/constants.ts";
import {decodeJwt} from "../utils/jwt.decoder.ts";

export class AuthService {
    private readonly userRepo: UserRepository;
    private readonly refreshRepo: RefreshRepository;

    constructor() {
        this.userRepo = new UserRepository();
        this.refreshRepo = new RefreshRepository();
    }

    async processSignUp(id: string, password: string) {
        try {
            const user = await this.userRepo.findUserByEmailOrPhone(id);
            if (user) {
                return {
                    message: 'User already exist',
                }
            }

            const hashedPassword = await bcrypt.hash(password, 10);
            const newUser = await this.userRepo.createUser(id, hashedPassword);
            const refreshToken = this.generateRefreshToken();
            const refreshData = await this.refreshRepo.saveRefreshToken(refreshToken, newUser.id);

            return {
                message: 'User has been created',
                accessToken: this.generateJWT(newUser.id, refreshData.id),
                refreshToken
            }
        } catch (error) {
            console.error(error);
            return {
                message: 'Internal server error'
            }
        }
    }

    async processSignIn(id: string, password: string) {
        try {
            const user = await this.userRepo.findUserByEmailOrPhone(id);

            if (!user) {
                return {
                    message: 'Invalid login or password',
                }
            }

            const isPasswordValid = await bcrypt.compare(password, user.password);

            if (!isPasswordValid) {
                return {
                    message: 'Invalid login or password',
                }
            }

            const refreshToken = this.generateRefreshToken();
            const refreshData = await this.refreshRepo.saveRefreshToken(refreshToken, user.id);

            return {
                message: 'Sign in successful',
                accessToken: this.generateJWT(user.id, refreshData.id),
                refreshToken
            }
        } catch (error) {
            console.error(error);
            return {
                message: 'Internal server error'
            }
        }
    }


    async processTokenRefresh(refreshToken: string) {
        try {
            const tokenRecord = await this.refreshRepo.getRefreshDataByToken(refreshToken);

            if (!tokenRecord) {
                return {
                    message: "Invalid refresh token",
                };
            }

            const tokenAge = new Date().getTime() - tokenRecord.createdAt.getTime();

            if (tokenAge > TOKEN_SETTINGS.REFRESH.MAX_AGE_MS) {
                await this.refreshRepo.deleteRefreshToken(refreshToken);

                return {
                    message: 'Refresh token expired',
                }
            }

            await this.refreshRepo.deleteRefreshToken(refreshToken);

            const newRefreshToken = this.generateRefreshToken();
            const newRefreshData = await this.refreshRepo.saveRefreshToken(newRefreshToken, tokenRecord.userId);

            return {
                accessToken: this.generateJWT(tokenRecord.userId, newRefreshData.id),
                refreshToken: newRefreshToken,
                message: "Token refreshed successfully"
            }
        } catch (error) {
            console.error("Refresh Error:", error);
            return {
                message: "Internal server error",
            };
        }
    }

    async getUserId(accessToken: string) {
       try {
           const payload = decodeJwt(accessToken)
           const session = await this.refreshRepo.getRefreshDataById(payload.sid);

           if (!session) {
               return {
                   message: "Session has expired",
               }
           }

           return {
               id: payload.id,
               message: 'Id has been retrieved successfully'
           }
       } catch (error) {
           console.error(error);
           return {
               message: "Internal server error",
           };
       }
    }

    async validateAccessToken(accessToken: string) {
        try {
            const payload = decodeJwt(accessToken);
            const session = await this.refreshRepo.getRefreshDataById(payload.sid);

            if (!session || session.userId !== payload.id) {
                return { message: "Session has expired" };
            }

            return {
                userId: payload.id,
                message: "Authorized"
            }
        } catch (error) {
            console.error(error);
            return {
                message: "Invalid access token"
            }
        }
    }

    async processLogOut(refreshToken: string) {
        try {
            const isDeleted = await this.refreshRepo.deleteRefreshToken(refreshToken);
            if (isDeleted) {
                return {
                    message: 'LogOut successfully',
                    isSuccess: true
                }
            } else {
                return {
                    message: 'Unauthorized',
                    isSuccess: false
                }
            }
        } catch (error) {
            console.error(error);
            return {
                message: "Internal server error",
                isSuccess: false
            };
        }
    }

    private generateJWT(userId: number, sid: number) {
        return jwt.sign(
            {id: userId, sid},
            TOKEN_SETTINGS.ACCESS.SECRET!,
            {expiresIn: TOKEN_SETTINGS.ACCESS.EXPIRES_IN_STRING}
        )
    }

    private generateRefreshToken(): string {
        return randomBytes(40).toString('hex');
    }
}
