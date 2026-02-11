import {type Request, type Response, Router } from "express";
import type {SignUpDto} from "../dto/auth.dto.ts";
import {AuthService} from "../service";

export class AuthController {
    router: Router;
    private readonly authService: AuthService;

    constructor() {
        this.router = Router();
        this.authService = new AuthService();
        this.initRoutes();
    }

    private initRoutes()  {
        this.router.post("/signin", this.processSignIn.bind(this));
        this.router.post("/signin/new_token", this.refreshToken.bind(this));
        this.router.post("/signup", this.processSignUp.bind(this));
        this.router.get("/info", this.getUserInfo.bind(this));
        this.router.get("/logout", this.logOut.bind(this));
    }

    private async processSignIn (request: Request, response: Response) {
    }

    private async refreshToken(request: Request, response: Response) {}

    private async processSignUp(request: Request<never, never, SignUpDto>, response: Response) {
        const body = request.body;
        if (!body.id || !body.password) {
            return response.status(400).json({message: "No credentials"});
        }
        const result = await this.authService.processSignUp(body.id, body.password);

        if (result.refreshToken && result.accessToken) {
            return response.status(200).json({message: result.message})
        } else {
            return response.status(500).json({message: result.message})
        }
    }

    private async getUserInfo (request: Request, response: Response) {}

    private async logOut (request: Request, response: Response) {}
}