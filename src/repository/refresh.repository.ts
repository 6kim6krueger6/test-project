import {PrismaClient} from "../generated/prisma/client.ts";
import {PrismaMariaDb} from "@prisma/adapter-mariadb";

export class RefreshRepository {
    prisma: PrismaClient;

    constructor() {
        const adapter = new PrismaMariaDb({
            host: Bun.env.DB_HOST,
            port: parseInt(Bun.env.DB_PORT!),
            connectionLimit: 5
        })
        this.prisma = new PrismaClient({adapter});
    }

    async saveRefreshToken(refreshToken: string, userId: number){
        return this.prisma.refreshToken.create({
            data: {
                token: refreshToken,
                userId
            }
        })
    }

    async getRefreshDataByToken(refreshToken: string){
        return this.prisma.refreshToken.findFirst({
            where: {
                token: refreshToken
            }
        })
    }

    async deleteRefreshToken(refreshToken: string){
         const result = await this.prisma.refreshToken.deleteMany({
            where: {
                token: refreshToken
            }
        })

        return result.count > 0
    }
}