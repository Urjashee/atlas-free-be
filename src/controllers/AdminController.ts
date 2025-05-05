import {Get, JsonController, Param, Req, Res, UseBefore} from "routing-controllers";
import {authMiddleware} from "../middleware/authMiddleware";
import {adminMiddleware} from "../middleware/adminMiddleware";
import {ResponseFormatter} from "../helper/ResponseFormatter";
import {Response, Request} from "express";
import {OrganizationService} from "../services/OrganizationService";
import {Users} from "../entity/Users";
import {ConfigService} from "../services/ConfigService";

@JsonController("/api/admin")
export class AdminController {
    private organizationService = new OrganizationService();
    private configService = new ConfigService();

    @Get("/organization/list/:filter")
    @UseBefore(authMiddleware)
    @UseBefore(adminMiddleware)
    async getOrganizationList(@Req() req: Request, @Res() res: Response, @Param("filter") filter: string) {
        try {

            const organizations = await this.organizationService.getOrganizations(filter)
            const customResponse =await Promise.all(
                organizations.map(async organization => {
                    const ids = (organization as any).primary_purpose.map(id => Number(id));
                    const purposes = await this.configService.getPrimaryPurposeById(ids);
                    return {
                        id: (organization.user as Users).id,
                        name: (organization.user as Users).user_name,
                        email: (organization.user as Users).email,
                        country_code: (organization.user as Users).country_code,
                        phone_no: (organization.user as Users).mobile,
                        zipcode: organization.zipcode,
                        website: organization.website,
                        year: organization.year,
                        address: organization.address,
                        primary_purpose: purposes.map(purpose => ({
                            id: purpose.id,
                            name: purpose.name,
                        })),
                        tax_status: organization.tax_exemption == false ? "No" : "Yes",
                        affiliation: (organization as any).affiliation.map(a => ({
                            id: a.affiliation.id,
                            name: a.affiliation.name,
                            file: a.affiliation_file
                        }))
                    }
                })
            )
            return ResponseFormatter.successResponse(res, "Organization list", customResponse)
        } catch (error: any) {
            return ResponseFormatter.errorResponse(res, error.message || 'An error occurred');
        }
    }
}
