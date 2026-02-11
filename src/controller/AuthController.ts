import {type Request, type Response, Router } from "express";

export class AuthController {
    router: Router;

    constructor() {
        this.router = Router();
        this.initRoutes();
    }

    private initRoutes()  {
        this.router.post("/signin", this.processSignIn.bind(this));
        this.router.post("/signin/new_token", this.refreshToken.bind(this));
        this.router.post("/signup", this.processSignUp.bind(this));
        this.router.get("/info", this.getUserInfo.bind(this));
        this.router.get("/logout", this.logOut.bind(this));
    }

    private async processSignIn (request: Request, response: Response) {}

    private async refreshToken(request: Request, response: Response) {}

    private async processSignUp(request: Request, response: Response) {}

    private async getUserInfo (request: Request, response: Response) {}

    private async logOut (request: Request, response: Response) {}
}