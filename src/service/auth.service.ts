import jwt from 'jsonwebtoken';
import bcrypt from "bcryptjs";
import { randomBytes } from "crypto";
import {UserRepository, RefreshRepository} from "../repository";
import {TOKEN_SETTINGS} from "../utils/constants.ts";

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

            await this.refreshRepo.saveRefreshToken(refreshToken, newUser.id)

            return {
                message: 'User has been created',
                accessToken: this.generateJWT(newUser.id),
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

            const accessToken = this.generateJWT(user.id);
            const refreshToken = this.generateRefreshToken();
            await this.refreshRepo.saveRefreshToken(refreshToken, user.id);

            return {
                message: 'Sign in successful',
                accessToken,
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

            const newAccessToken = this.generateJWT(tokenRecord.userId);
            const newRefreshToken = this.generateRefreshToken();

            await this.refreshRepo.saveRefreshToken(newRefreshToken, tokenRecord.userId);

            return {
                accessToken: newAccessToken,
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

     getUserId(refreshToken: string) {
       try {
           const payload = jwt.verify(
               refreshToken,
               TOKEN_SETTINGS.REFRESH.SECRET
           ) as { id: number };

           if (payload) {
               return {
                   id: payload.id,
                   message: 'Id has been retrieved successfully'
               }
           } else {
               return {
                   message: "No retrieved token",
               }
           }
       } catch (error) {
           console.error(error);
           return {
               message: "Internal server error",
           };
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
                    message: 'Internal server error',
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

    private generateJWT(userId: number) {
        return jwt.sign(
            {id: userId},
            TOKEN_SETTINGS.ACCESS.SECRET!,
            {expiresIn: TOKEN_SETTINGS.ACCESS.EXPIRES_IN_STRING}
        )
    }

    private generateRefreshToken(): string {
        return randomBytes(40).toString('hex');
    }
}