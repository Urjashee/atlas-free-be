import {Get, JsonController, Req, Res} from "routing-controllers";
import {ConfigService} from "./ConfigService";
import {Request, Response} from "express";
import {ResponseFormatter} from "@inquitickets/response";

@JsonController("/api/auth")
export class AuthController {
    private configService = new ConfigService();

    @Get("/organization/register")
    async registerOrganization(@Req() req: Request, @Res() res: Response) {
        try {
            if (!req.body) {
                return ResponseFormatter.errorResponse(res, 'Request body is undefined.');
            }

        } catch (error: any) {
            return ResponseFormatter.errorResponse(res, error.message || 'An error occurred');
        }
    }
}
