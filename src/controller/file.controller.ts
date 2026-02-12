import {type Request, type Response, Router } from "express";
import {uploadMiddleware} from "../middleware/upload.ts";
import path from "path";
import type {RequestWithCookies} from "../types/express";
import {COOKIE_NAMES} from "../utils/constants.ts";
import {decodeJwt} from "../utils/jwt.decoder.ts";
import {FileService} from "../service";
import jwt from "jsonwebtoken";

export class FileController {
    router: Router;
    private readonly fileService: FileService;

    constructor() {
        this.router = Router();
        this.fileService = new FileService();
        this.initRoutes();
    }

    private initRoutes() {
        this.router.post("/upload", uploadMiddleware.single("file"), this.uploadFile.bind(this));
        this.router.get("/list", this.getFiles.bind(this) );
        this.router.delete("/delete/:id", this.deleteFile.bind(this) );
        this.router.get("/:id", this.getFile.bind(this) );
        this.router.get("/download/:id", this.downloadFile.bind(this) );
        this.router.put("/update/:id", this.updateFile.bind(this) );
    }

    private async uploadFile(request: RequestWithCookies<{accessToken: string}>, response: Response) {
        const accessToken = request.cookies[COOKIE_NAMES.ACCESS_TOKEN];

        if (!accessToken) {
            return response.status(401).json({message: "Access token not found"});
        }
        try {
            if (!request.file) {
                return response.status(400).json({ message: "No file uploaded" });
            }

            const file = request.file;
            const userId = decodeJwt(accessToken).id;

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

            if (error instanceof jwt.JsonWebTokenError) {
                return response.status(403).json({ message: "Invalid token" });
            }

            return response.status(500).json({ message: "Internal server error" });
        }
    }

    private async getFiles(request: Request, response: Response) {}

    private async deleteFile(request: Request<{ id: string; }>, response: Response) {
        try {
            const { id } = request.params;
            const fileId = Number(id);

            if (isNaN(fileId)) {
                return response.status(400).json({ message: "Invalid ID format" });
            }

            const result = await this.fileService.deleteFile(fileId);

            return response.status(200).json({ message: result.message });
        } catch (error) {
            console.error("Delete file error:", error);

            if (error instanceof Error && error.message.includes("not found")) {
                return response.status(404).json({ message: "File not found" });
            }

            return response.status(500).json({ message: "Internal server error" });
        }
    }

    private async getFile(request: Request<{ id: string; }>, response: Response) {
        try {
            const { id } = request.params;
            const fileId = Number(id);

            if (isNaN(fileId)) {
                return response.status(400).json({ message: "Invalid ID format" });
            }

            const result = await this.fileService.getFileById(fileId);
            if (result.file) {
                return response.status(200).json(result.message)
            } else{
                return response.status(400).json({message: result.message});
            }
        } catch (error) {
            console.error("Delete file error:", error);

            if (error instanceof Error && error.message.includes("not found")) {
                return response.status(404).json({ message: "File not found" });
            }

            return response.status(500).json({ message: "Internal server error" });
        }
    }

    private downloadFile(request: Request, response: Response) {}

    private updateFile(request: Request, response: Response) {}

}

