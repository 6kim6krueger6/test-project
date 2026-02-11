import {PrismaClient} from "../generated/prisma/client";
import {PrismaMariaDb} from "@prisma/adapter-mariadb";

export class UserRepository {
    prisma: PrismaClient;

    constructor() {
        const adapter = new PrismaMariaDb({
            host: Bun.env.DB_HOST,
            port: parseInt(Bun.env.DB_PORT!),
            connectionLimit: 5
        })
        this.prisma = new PrismaClient({adapter});


    }

    async findUserByEmailOrPhone(id: string) {
        return this.prisma.user.findUnique({where: {loginId: id}});
    }

    async createUser (id: string, hashedPassword: string) {
        return this.prisma.user.create({
            data: {
                loginId: id,
                password: hashedPassword,
            },
        });
    }

}