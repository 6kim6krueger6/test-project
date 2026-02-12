import {PrismaClient} from "../generated/prisma/client.ts";
import {PrismaMariaDb} from "@prisma/adapter-mariadb";

export class PrismaRepository{
    prisma: PrismaClient;

    constructor() {
        const adapter = new PrismaMariaDb({
            host: Bun.env.DB_HOST,
            port: parseInt(Bun.env.DB_PORT!),
            user: Bun.env.DB_USER,
            password: Bun.env.DB_PASSWORD,
            database: Bun.env.DB_NAME,
            connectionLimit: 5
        })
        this.prisma = new PrismaClient({adapter});
    }

}


export const prisma = new PrismaRepository();