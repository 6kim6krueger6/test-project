import {type Request, type Response, Router } from "express";

export class FileController {
    router: Router;

    constructor() {
        this.router = Router();
        this.initRoutes();
    }

    private initRoutes() {
        this.router.post("/upload", this.uploadFile.bind(this));
        this.router.get("/list", this.getFiles.bind(this) );
        this.router.delete("/delete/:id", this.deleteFile.bind(this) );
        this.router.get("/:id", this.getFile.bind(this) );
        this.router.get("/download/:id", this.downloadFile.bind(this) );
        this.router.put("/update/:id", this.updateFile.bind(this) );
    }

    private async uploadFile(req: Request, res: Response) {}

    private async getFiles(req: Request, res: Response) {}

    private async deleteFile(req: Request, res: Response) {}

    private async getFile(req: Request, res: Response) {}

    private downloadFile(req: Request, res: Response) {}

    private updateFile(req: Request, res: Response) {}

}

