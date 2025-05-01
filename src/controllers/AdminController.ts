import {Get, JsonController, Param, Req, Res, UseBefore} from "routing-controllers";
import {authMiddleware} from "../middleware/authMiddleware";
import {adminMiddleware} from "../middleware/adminMiddleware";
import {ResponseFormatter} from "../helper/ResponseFormatter";
import {Response, Request} from "express";
import {OrganizationService} from "../services/OrganizationService";

@JsonController("/api/admin")
export class AdminController {
    private organizationService = new OrganizationService();

    @Get("/organization/list/:filter")
    @UseBefore(authMiddleware)
    @UseBefore(adminMiddleware)
    async getOrganizationList(@Req() req: Request, @Res() res: Response, @Param("filter") filter: string) {
        try {
            const organization = await this.organizationService.getOrganizations(filter)
            return ResponseFormatter.successResponse(res, "Organization list", organization)
        } catch (error: any) {
            return ResponseFormatter.errorResponse(res, error.message || 'An error occurred');
        }
    }
}
