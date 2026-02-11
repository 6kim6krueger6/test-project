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