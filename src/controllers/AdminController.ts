import {Get, JsonController, Param, Post, Req, Res, UseBefore} from "routing-controllers";
import {authMiddleware} from "../middleware/authMiddleware";
import {adminMiddleware} from "../middleware/adminMiddleware";
import {ResponseFormatter} from "../helper/ResponseFormatter";
import {Response, Request} from "express";
import {OrganizationService} from "../services/OrganizationService";
import {Users} from "../entity/Users";
import {ConfigService} from "../services/ConfigService";
import {upload} from "../helper/MulterConfig";
import Joi from "joi";
import {UserService} from "../services/UserService";

const adminOrgEditSchema = Joi.object({
    id: Joi.number().required(),
    user_name: Joi.string().min(3).max(150).required(),
    email: Joi.string().email().pattern(/^\S+$/).required(),
    country_code: Joi.string().min(2).max(5).required(),
    phone_no: Joi.string().pattern(/^\d+$/).min(6).max(16).required(),
    address: Joi.string().min(3).max(1600).required(),
    disclose_address: Joi.boolean().required(),
    zipcode: Joi.string().min(4).max(10).required(),
    year: Joi.string().min(4).max(5).required(),
    website: Joi.string().min(4).max(100).required(),
    tax_exemption: Joi.number().min(0).max(1).required(),
    primary_purpose: Joi.array().items(Joi.number()).required(),
    affiliation_license: Joi.array().items(Joi.number()).required(),
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
    @Post("/organization/list/:filter")
    @UseBefore(authMiddleware)
    @UseBefore(adminMiddleware)
    @UseBefore(upload.array("affiliation_files", 10))
    async updateOrganizationDetails(@Req() req: Request, @Res() res: Response) {
        try {
            let affiliationFiles = [];
            const files = req.files as Express.Multer.File[];
            if (!req.body) {
                return ResponseFormatter.errorResponse(res, 'Request body is undefined.');
            }
            const {error} = adminOrgEditSchema.validate(req.body);
            if (error) {
                return ResponseFormatter.errorResponse(res, error.details[0].message);
            }
            const existingUser = await this.userService.findByEmail(req.body.email);
            if (existingUser) {
                return ResponseFormatter.errorResponse(res, 'Email already in use');
            }
            const user = await this.userService.updateUser(req.body.id, req.body);
            const affiliation = await this.userService.updateAffiliations(req.body.id, req.body);
            if (!user)
                return ResponseFormatter.successResponse(res, 'User not updated')
            return ResponseFormatter.successResponse(res, 'User updated')

        } catch (error: any) {
            return ResponseFormatter.errorResponse(res, error.message || 'An error occurred');
        }
    }
}
