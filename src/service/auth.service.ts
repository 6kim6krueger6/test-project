import jwt from 'jsonwebtoken';
import bcrypt from "bcryptjs";
import { randomBytes } from "crypto";
import {UserRepository, RefreshRepository} from "../repository";

export class AuthService {
    private readonly userRepo: UserRepository;
    private readonly resreshRepo: RefreshRepository;

    constructor() {
        this.userRepo = new UserRepository();
        this.resreshRepo = new RefreshRepository();
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

            await this.resreshRepo.saveRefreshToken(refreshToken, newUser.id)

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

    private generateJWT(userId: number) {
        return jwt.sign(
            {id: userId},
            Bun.env.JWT_SECRET!,
            {expiresIn: '10m'}
        )
    }

    private generateRefreshToken(): string {
        return randomBytes(40).toString('hex');
    }
}