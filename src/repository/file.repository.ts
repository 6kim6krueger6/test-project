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