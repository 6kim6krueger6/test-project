import {type Request, type Response, Router} from "express";
import type {SignInDto, SignUpDto} from "../dto/auth.dto.ts";
import {AuthService} from "../service";
import {BASE_COOKIE_OPTIONS, COOKIE_NAMES, TOKEN_SETTINGS} from "../utils/constants.ts";

export class AuthController {
    router: Router;
    private readonly authService: AuthService;

    constructor() {
        this.router = Router();
        this.authService = new AuthService();
        this.initRoutes();
    }

    private initRoutes() {
        this.router.post("/signin", this.processSignIn.bind(this));
        this.router.post("/signin/new_token", this.refreshToken.bind(this));
        this.router.post("/signup", this.processSignUp.bind(this));
        this.router.get("/info", this.getUserInfo.bind(this));
        this.router.get("/logout", this.logOut.bind(this));
    }


    private async processSignIn(request: Request<never, never, SignInDto>, response: Response) {
        const body = request.body;
        if (!body.id || !body.password) {
            return response.status(400).json({message: "No credentials"});
        }

        const result = await this.authService.processSignIn(body.id, body.password);

        return this.sendAuthResponse(response, result);
    }

    private async processSignUp(request: Request<never, never, SignUpDto>, response: Response) {
        const body = request.body;
        if (!body.id || !body.password) {
            return response.status(400).json({message: "No credentials"});
        }

        const result = await this.authService.processSignUp(body.id, body.password);

        return this.sendAuthResponse(response, result);
    }

    private async refreshToken(request: Request, response: Response) {}

    private async getUserInfo(request: Request, response: Response) {}

    private async logOut(request: Request, response: Response) {}

    private sendAuthResponse(response: Response, result: {
        accessToken?: string;
        refreshToken?: string;
        message: string;
    }) {
        if (result.accessToken && result.refreshToken) {

            response.cookie(COOKIE_NAMES.ACCESS_TOKEN, result.accessToken, {
                ...BASE_COOKIE_OPTIONS,
                maxAge: TOKEN_SETTINGS.ACCESS.MAX_AGE_MS
            });

            response.cookie(COOKIE_NAMES.REFRESH_TOKEN, result.refreshToken, {
                ...BASE_COOKIE_OPTIONS,
                maxAge: TOKEN_SETTINGS.REFRESH.MAX_AGE_MS
            });

            return response.status(200).json({ message: result.message });
        } else {
            return response.status(500).json({ message: result.message });
        }

    }
}