import {type Request, type Response, Router } from "express";
import {uploadMiddleware} from "../middleware/upload.ts";
import path from "path";
import type {RequestWithCookies} from "../types/express";
import {COOKIE_NAMES} from "../utils/constants.ts";
import {FileService, AuthService} from "../service";

export class FileController {
    router: Router;
    private readonly fileService: FileService;
    private readonly authService: AuthService;

    constructor() {
        this.router = Router();
        this.fileService = new FileService();
        this.authService = new AuthService();
        this.initRoutes();
    }

    private initRoutes() {
        this.router.post("/upload", uploadMiddleware.single("file"), this.uploadFile.bind(this));
        this.router.get("/list", this.getFiles.bind(this) );
        this.router.delete("/delete/:id", this.deleteFile.bind(this) );
        this.router.get("/download/:id", this.downloadFile.bind(this) );
        this.router.put("/update/:id", uploadMiddleware.single("file"), this.updateFile.bind(this) );
        this.router.get("/:id", this.getFile.bind(this) );
    }

    private async getAuthorizedUserId(request: RequestWithCookies<{accessToken: string}>, response: Response) {
        const accessToken = request.cookies[COOKIE_NAMES.ACCESS_TOKEN];

        if (!accessToken) {
            response.status(401).json({message: "Access token not found"});
            return null;
        }

        const authData = await this.authService.validateAccessToken(accessToken);

        if (!authData.userId) {
            response.status(401).json({ message: authData.message });
            return null;
        }

        return authData.userId;
    }

    private async uploadFile(request: RequestWithCookies<{accessToken: string}>, response: Response) {
        const userId = await this.getAuthorizedUserId(request, response);
        if (!userId) {
            return;
        }

        try {
            if (!request.file) {
                return response.status(400).json({ message: "No file uploaded" });
            }

            const file = request.file;

            const fileData = {
                name: file.originalname,
                extension: path.extname(file.originalname),
                mimeType: file.mimetype,
                size: file.size,
                path: file.path,
                userId
            };

            const savedFile = await this.fileService.uploadFile(fileData);

            return response.status(201).json({
                message: "File uploaded successfully",
                file: savedFile
            });

        } catch (error) {
            console.error("Upload error:", error);
            return response.status(500).json({ message: "Internal server error" });
        }
    }

    private async getFiles(request: RequestWithCookies<{accessToken: string}>, response: Response) {
        const userId = await this.getAuthorizedUserId(request, response);
        if (!userId) {
            return;
        }

        const page = Number(request.query.page ?? 1);
        const listSize = Number(request.query.list_size ?? 10);

        if (isNaN(page) || isNaN(listSize)) {
            return response.status(400).json({ message: "Invalid pagination params" });
        }

        const files = await this.fileService.getFiles(userId, page, listSize);

        return response.status(200).json(files);
    }

    private async deleteFile(request: RequestWithCookies<{ id: string; accessToken: string }>, response: Response) {
        const userId = await this.getAuthorizedUserId(request, response);
        if (!userId) {
            return;
        }

        try {
            const { id } = request.params;
            const fileId = Number(id);

            if (isNaN(fileId)) {
                return response.status(400).json({ message: "Invalid ID format" });
            }

            const result = await this.fileService.deleteFile(fileId, userId);

            return response.status(200).json({ message: result.message });
        } catch (error) {
            console.error("Delete file error:", error);

            if (error instanceof Error && error.message.includes("not found")) {
                return response.status(404).json({ message: "File not found" });
            }

            return response.status(500).json({ message: "Internal server error" });
        }
    }

    private async getFile(request: RequestWithCookies<{ id: string; accessToken: string }>, response: Response) {
        const userId = await this.getAuthorizedUserId(request, response);
        if (!userId) {
            return;
        }

        try {
            const { id } = request.params;
            const fileId = Number(id);

            if (isNaN(fileId)) {
                return response.status(400).json({ message: "Invalid ID format" });
            }

            const result = await this.fileService.getFileById(fileId, userId);
            if (result.file) {
                return response.status(200).json(result.file)
            } else{
                return response.status(404).json({message: result.message});
            }
        } catch (error) {
            console.error("Get file error:", error);

            if (error instanceof Error && error.message.includes("not found")) {
                return response.status(404).json({ message: "File not found" });
            }

            return response.status(500).json({ message: "Internal server error" });
        }
    }

    private async downloadFile(request: RequestWithCookies<{ id: string; accessToken: string }>, response: Response) {
        const userId = await this.getAuthorizedUserId(request, response);
        if (!userId) {
            return;
        }

        const fileId = Number(request.params.id);

        if (isNaN(fileId)) {
            return response.status(400).json({ message: "Invalid ID format" });
        }

        const result = await this.fileService.getFileById(fileId, userId);

        if (!result.file) {
            return response.status(404).json({ message: "File not found" });
        }

        return response.download(result.file.path, result.file.name);
    }

    private async updateFile(request: RequestWithCookies<{ id: string; accessToken: string }>, response: Response) {
        const userId = await this.getAuthorizedUserId(request, response);
        if (!userId) {
            return;
        }

        try {
            const { id } = request.params;
            const fileId = Number(id);

            if (isNaN(fileId)) {
                return response.status(400).json({ message: "Invalid file ID format" });
            }

            if (!request.file) {
                return response.status(400).json({ message: "No new file uploaded" });
            }

            const file = request.file;

            const fileUpdateData = {
                name: file.originalname,
                extension: path.extname(file.originalname),
                mimeType: file.mimetype,
                size: file.size,
                path: file.path,
                userId
            };

            const updatedFile = await this.fileService.updateFile(fileId, userId, fileUpdateData);

            return response.status(200).json({
                message: "File updated successfully",
                file: updatedFile
            });

        } catch (error) {
            console.error("Update error:", error);
            if (error instanceof Error && error.message.includes("not found")) {
                return response.status(404).json({ message: "File not found" });
            }

            return response.status(500).json({ message: "Internal server error" });
        }
    }

}
