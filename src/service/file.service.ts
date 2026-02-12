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

    async deleteFile(fileId: number) {
        const file = await this.fileRepository.getFileById(fileId);

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
}