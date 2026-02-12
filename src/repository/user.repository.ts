import {prisma, PrismaRepository} from "./prisma.client.ts";

export class UserRepository {
    prismaClient: PrismaRepository;

    constructor() {
        this.prismaClient = prisma;
    }

    async findUserByEmailOrPhone(id: string) {
        return this.prismaClient.prisma.user.findUnique({where: {loginId: id}});
    }

    async createUser (id: string, hashedPassword: string) {
        return this.prismaClient.prisma.user.create({
            data: {
                loginId: id,
                password: hashedPassword,
            },
        });
    }

}