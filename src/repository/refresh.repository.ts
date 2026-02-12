import {prisma, PrismaRepository} from "./prisma.client.ts";

export class RefreshRepository {
    prismaClient: PrismaRepository;

    constructor() {
        this.prismaClient = prisma;
    }

    async saveRefreshToken(refreshToken: string, userId: number){
        return this.prismaClient.prisma.refreshToken.create({
            data: {
                token: refreshToken,
                userId
            }
        })
    }

    async getRefreshDataByToken(refreshToken: string){
        return this.prismaClient.prisma.refreshToken.findFirst({
            where: {
                token: refreshToken
            }
        })
    }

    async getRefreshDataById(id: number) {
        return this.prismaClient.prisma.refreshToken.findUnique({
            where: { id }
        });
    }

    async deleteRefreshToken(refreshToken: string){
         const result = await this.prismaClient.prisma.refreshToken.deleteMany({
            where: {
                token: refreshToken
            }
        })

        return result.count > 0
    }
}
