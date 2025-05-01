import {Get, JsonController, Req, Res, UseBefore} from "routing-controllers";
import {UserService} from "../services/UserService";
import S3UploadService from "../helper/S3UploadService";
import {JwtHelper} from "../helper/JwtHelper";
import {authMiddleware} from "../middleware/authMiddleware";
import {adminMiddleware} from "../middleware/adminMiddleware";
import {ResponseFormatter} from "../helper/ResponseFormatter";
import {Response, Request} from "express";

@JsonController("/api/admin")
export class AdminController {
    private userService = new UserService();
    private s3UploadService = new S3UploadService();
    private jwtHelper = new JwtHelper();

    @Get("/organization/list")
    @UseBefore(authMiddleware)
    @UseBefore(adminMiddleware)
    async getOrganizationList(@Req() req: Request, @Res() res: Response) {
        try {

            return ResponseFormatter.successResponse(res, "Organization list")
        } catch (error: any) {
            return ResponseFormatter.errorResponse(res, error.message || 'An error occurred');
        }
    }
}
