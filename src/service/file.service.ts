import {FileRepository} from "../repository";
import fs from "fs";
import type {FileUploadDto} from "../dto/file.dto.ts";

export class FileService {
    private readonly fileRepository: FileRepository;

    constructor() {
        this.fileRepository = new FileRepository();
    }

    async uploadFile(fileData: FileUploadDto) {
        return this.fileRepository.saveFile(fileData);
    }

    async getFiles(userId: number, page: number, listSize: number) {
        const safePage = Math.max(1, page);
        const safeListSize = Math.max(1, listSize);
        const skip = (safePage - 1) * safeListSize;

        const { items, total } = await this.fileRepository.listFiles(userId, skip, safeListSize);

        return {
            page: safePage,
            listSize: safeListSize,
            total,
            files: items
        };
    }

    async deleteFile(fileId: number, userId: number) {
        const file = await this.fileRepository.getFileByIdForUser(fileId, userId);

        if (!file) {
            throw new Error("File not found in database");
        }

        await this.fileRepository.deleteFile(fileId);
        try {
            if (fs.existsSync(file.path)) {
                fs.unlinkSync(file.path);
            } else {
                console.warn(`File with id ${fileId} not found on disk at ${file.path}`);
            }
        } catch (err){
            console.error(`Failed to delete file from disk: ${file.path}`, err);
            return {message: "Failed to delete file from disk"};
        }
        return { message: "File deleted successfully" }
    }

    async getFileById(fileId: number, userId: number) {
        try {
            const file = await this.fileRepository.getFileByIdForUser(fileId, userId);

            if (file) {
                return {
                    message: "Successfully got file with id " + fileId,
                    file
                }
            } else {
                return {
                    message: "File not found"
                }
            }
        } catch (err) {
            console.error(`Failed to get file with id ${fileId}`, err);
            return {
                message: "Failed to get file with id " + fileId
            };
        }
    }

    async updateFile(id: number, userId: number, newData: FileUploadDto) {
        const oldFile = await this.fileRepository.getFileByIdForUser(id, userId);

        if (!oldFile) {
            if (fs.existsSync(newData.path)) fs.unlinkSync(newData.path);
            throw new Error("File not found");
        }

        try {
            if (fs.existsSync(oldFile.path)) {
                fs.unlinkSync(oldFile.path);
            }
        } catch (err) {
            console.error(`Failed to delete old file: ${oldFile.path}`, err);
        }

        return this.fileRepository.updateFile(id, newData);
    }
}
