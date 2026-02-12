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

    async deleteFile(fileId: number) {
         return this.prismaClient.prisma.file.delete({
             where: {
                 id: fileId,
             }
         });
    }

    async getFileById(fileId: number) {
        return this.prismaClient.prisma.file.findUnique({
            where: { id: fileId }
        });
    }

    async getFileByIdForUser(fileId: number, userId: number) {
        return this.prismaClient.prisma.file.findFirst({
            where: { id: fileId, userId }
        });
    }

    async listFiles(userId: number, skip: number, take: number) {
        const [items, total] = await Promise.all([
            this.prismaClient.prisma.file.findMany({
                where: { userId },
                orderBy: { uploadDate: "desc" },
                skip,
                take
            }),
            this.prismaClient.prisma.file.count({ where: { userId } })
        ]);

        return { items, total };
    }

    async updateFile(id: number, data: FileUploadDto) {
        return this.prismaClient.prisma.file.update({
            where: { id: id },
            data: {
                name: data.name,
                extension: data.extension,
                mimeType: data.mimeType,
                size: data.size,
                path: data.path,
            }
        });
    }

}
