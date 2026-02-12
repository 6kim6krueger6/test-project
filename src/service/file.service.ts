import {FileRepository} from "../repository";
import type {FileUploadDto} from "../dto/file.dto.ts";

export class FileService {
    private readonly fileRepository: FileRepository;

    constructor() {
        this.fileRepository = new FileRepository();
    }

    async uploadFile(fileData: FileUploadDto) {
        return this.fileRepository.saveFile(fileData);
    }
}