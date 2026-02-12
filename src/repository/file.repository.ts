import {prisma, PrismaRepository} from "./prisma.client.ts";
import type {FileUploadDto} from "../dto/file.dto.ts";

export class FileRepository{
    prismaClient: PrismaRepository;

    constructor() {
        this.prismaClient = prisma;
    }

    async saveFile(data: FileUploadDto) {
        return this.prismaClient.prisma.file.create({
            data: {
                name: data.name,
                extension: data.extension,
                mimeType: data.mimeType,
                size: data.size,
                path: data.path,
                userId: data.userId,
            }
        });
    }

}