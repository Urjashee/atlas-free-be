import {Get, JsonController, Param, Patch, Post, Req, Res, UseBefore} from "routing-controllers";
import {authMiddleware} from "../middleware/authMiddleware";
import {adminMiddleware} from "../middleware/adminMiddleware";
import {ResponseFormatter} from "../helper/ResponseFormatter";
import {Response, Request} from "express";
import {OrganizationService} from "../services/OrganizationService";
import {Users} from "../entity/Users.entity";
import {ConfigService} from "../services/ConfigService";
import {upload} from "../helper/MulterConfig";
import Joi from "joi";
import {UserService} from "../services/UserService";

const adminOrgEditSchema = Joi.object({
    organization_id: Joi.number().required(),
    country_code: Joi.string().min(2).max(5).required(),
    phone_no: Joi.string().pattern(/^\d+$/).min(6).max(16).required(),
    address: Joi.string().min(3).max(1600).required(),
    disclose_address: Joi.boolean().required(),
    zipcode: Joi.string().min(4).max(10).required(),
    year: Joi.string().min(4).max(5).required(),
    website: Joi.string().min(4).max(100).required(),
    tax_exemption: Joi.number().min(0).max(1).required(),
    primary_purpose: Joi.array().items(Joi.number()).required(),
    affiliations: Joi.string().required(),
});

@JsonController("/api/admin")
export class AdminController {
    private organizationService = new OrganizationService();
    private configService = new ConfigService();
    private userService = new UserService();

    @Get("/organization/list/:filter")
    @UseBefore(authMiddleware)
    @UseBefore(adminMiddleware)
    async getOrganizationList(@Req() req: Request, @Res() res: Response, @Param("filter") filter: string) {
        try {

            const organizations = await this.organizationService.getOrganizations(filter)
            const customResponse =await Promise.all(
                organizations.map(async organization => {
                    const ids = organization.organization.primary_purpose.map(id => Number(id));
                    const purposes = await this.configService.getPrimaryPurposeById(ids);
                    return {
                        id: organization.organization.id,
                        name: organization.organization.name,
                        email: organization.email,
                        country_code: organization.country_code,
                        phone_no: organization.mobile,
                        zipcode: organization.organization.zipcode,
                        website: organization.organization.website,
                        year: organization.organization.year,
                        address: organization.organization.address,
                        primary_purpose: purposes.map(purpose => ({
                            id: purpose.id,
                            name: purpose.name,
                        })),
                        tax_status: organization.organization.tax_exemption == false ? "No" : "Yes",
                        affiliation: organization.organization.affiliations.map(a => ({
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
    @Post("/organization/edit")
    @UseBefore(authMiddleware)
    @UseBefore(adminMiddleware)
    @UseBefore(upload.array("affiliation_files", 10))
    async updateOrganizationDetails(@Req() req: Request, @Res() res: Response) {
        try {
            if (!req.body) {
                return ResponseFormatter.errorResponse(res, 'Request body is undefined.');
            }
            const {error} = adminOrgEditSchema.validate(req.body);
            if (error) {
                return ResponseFormatter.errorResponse(res, error.details[0].message);
            }
            const user = await this.userService.updateUser(req.body.organization_id, req.body);
            if (!user)
                return ResponseFormatter.successResponse(res, 'User not updated')
            return ResponseFormatter.successResponse(res, 'User updated')

        } catch (error: any) {
            return ResponseFormatter.errorResponse(res, error.message || 'An error occurred');
        }
    }

    @Patch("/organization/status/:organization_id")
    @UseBefore(authMiddleware)
    @UseBefore(adminMiddleware)
    async updateOrganizationStatus(@Req() req: Request, @Res() res: Response, @Param("organization_id") organization_id: number) {
        try {
            const organization = await this.organizationService.updateStatus(organization_id)
            if (!organization)
                return ResponseFormatter.errorResponse(res, 'Not an organization')
            return ResponseFormatter.successResponse(res, 'Status updated')

        } catch (error: any) {
            return ResponseFormatter.errorResponse(res, error.message || 'An error occurred');
        }
    }
}
