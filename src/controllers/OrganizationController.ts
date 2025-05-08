import {JsonController, Param, Post, Req, Res, UseBefore} from "routing-controllers";
import {UserService} from "../services/UserService";
import {OrganizationService} from "../services/OrganizationService";
import {ConfigService} from "../services/ConfigService";
import {authMiddleware} from "../middleware/authMiddleware";
import {Request, Response} from "express";
import {ResponseFormatter} from "../helper/ResponseFormatter";
import Joi from "joi";
import {organizationMiddleware} from "../middleware/organizationMiddleware";

const clientSlots = Joi.object({
    id: Joi.number(),
    name: Joi.string().required(),
    service_type:Joi.number(),
    client_slots:Joi.number(),
    slots_beds:Joi.number(),
    start_day_of_service:Joi.date(),
    service_limited:Joi.boolean(),
    enrollment_type:Joi.number(),
    enrollment_period:Joi.number(),
    extension:Joi.boolean(),
    waitlist:Joi.boolean(),
    service_description: Joi.string(),
    minimum_age: Joi.number(),
    maximum_age: Joi.number(),
    genders_served:Joi.array().items(Joi.number()).required(),
    served_to:Joi.array().items(Joi.number()).required(),
    minimum_children_age:Joi.number(),
    maximum_children_age:Joi.number(),
    maximum_children_intake:Joi.number(),
    citizenship_requirement:Joi.array().items(Joi.number()).required(),
    language_requirement:Joi.array().items(Joi.number()).required(),
    out_of_state_relocation:Joi.boolean()
});
@JsonController("/api/organization")
export class AuthController {
    private userService = new UserService();
    private organizationService = new OrganizationService();
    private configService = new ConfigService();

    @Post("/services/settings")
    @UseBefore(authMiddleware)
    @UseBefore(organizationMiddleware)
    async addOrganization(@Req() req: Request, @Res() res: Response) {
        try {
            if (!req.body) {
                return ResponseFormatter.errorResponse(res, 'Request body is undefined.');
            }
            const {error} = clientSlots.validate(req.body);
            if (error) {
                return ResponseFormatter.errorResponse(res, error.details[0].message);
            }

            if (req.body.id) {
                const checkIfValidOrganization = await this.organizationService.checkIfValidOrganization(req.body.id, req.user.id);
                if (!checkIfValidOrganization)
                    return ResponseFormatter.errorResponse(res, 'Invalid service');
                const settings = await this.organizationService.editOrganizationSettings(req.body.id, req.user.id, req.body)
                if (!settings)
                    return ResponseFormatter.errorResponse(res, "Can't edit, try again later" );
            } else {
                const settings = await this.organizationService.addOrganizationSettings(req.user.id, req.body)
                if (!settings)
                    return ResponseFormatter.errorResponse(res, "Can't add, try again later");
            }
            return ResponseFormatter.successResponse(res, "Successful");
        } catch (error: any) {
            return ResponseFormatter.errorResponse(res, error.message || 'An error occurred');
        }
    }
}
