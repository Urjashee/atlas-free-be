import {Get, JsonController, Param, Post, Req, Res, UseBefore} from "routing-controllers";
import {UserService} from "../services/User.service";
import {OrganizationService} from "../services/Organization.service";
import {ConfigService} from "../services/Config.service";
import {authMiddleware} from "../middleware/Auth.middleware";
import {Request, Response} from "express";
import {ResponseFormatter} from "../helper/ResponseFormatter.helper";
import Joi from "joi";
import {organizationMiddleware} from "../middleware/Organization.middleware";
import {getOrganizationsDetails, getOrganizationsServiceDetails} from "../util/Organization.util";
import {upload} from "../helper/MulterConfig.helper";
import {servicesSchema} from "../schema/Services.schema";
import {DaysOfWeek, TimeZone} from "../entity/EmailReminder.entity";


const organizationEditSchema = Joi.object({
    country_code: Joi.string().min(2).max(5).required(),
    phone_no: Joi.string().pattern(/^\d+$/).min(6).max(16).required(),
    street: Joi.string().min(3).max(1600).required(),
    address: Joi.string().min(3).max(1600).required(),
    state: Joi.number().required(),
    city: Joi.string().min(3).max(100).required(),
    disclose_address: Joi.boolean().required(),
    zipcode: Joi.string().min(4).max(10).required(),
    year: Joi.string().min(4).max(5).required(),
    website: Joi.string().min(4).max(100).required(),
    tax_exemption: Joi.number().min(0).max(1).required(),
    primary_purpose: Joi.array().items(Joi.number()).required(),
    affiliations: Joi.string().required(),
});

const emailReminderSchema = Joi.object({
    id: Joi.number().optional(),
    email: Joi.string().email().required(),
    day_of_week: Joi.required(),
    time: Joi.string()
        .pattern(/^([0-1]\d|2[0-3]):([0-5]\d)$/) // HH:MM 24-hour format
        .required(),
    time_zone: Joi.string().required()
});


const serviceSettingsSchema = Joi.object({
    service_id: Joi.number().required(),
    available_slots: Joi.number().required(),
    service_manager: Joi.array().items(Joi.string()).required(),
    contact_email: Joi.string().required(),
    contact_phone: Joi.number().required(),
    emailReminders: Joi.array().items(emailReminderSchema).min(1).required()
})

const sendInvitationSchema = Joi.object({
    email: Joi.string().email().pattern(/^\S+$/).required(),
    role: Joi.number().required()
})

@JsonController("/api/organization")
export class AuthController {
    private userService = new UserService();
    private organizationService = new OrganizationService();
    private configService = new ConfigService();

    @Post("/services")
    @UseBefore(authMiddleware)
    @UseBefore(organizationMiddleware)
    async addOrganization(@Req() req: Request, @Res() res: Response) {
        try {
            if (!req.body) {
                return ResponseFormatter.errorResponse(res, 'Request body is undefined.');
            }
            const {error} = servicesSchema.validate(req.body);
            if (error) {
                return ResponseFormatter.errorResponse(res, error.details[0].message);
            }

            if (req.body.id) {
                const checkIfValidOrganization = await this.organizationService.checkIfValidOrganization(req.body.id, req.user.organization_id);
                if (!checkIfValidOrganization)
                    return ResponseFormatter.errorResponse(res, 'Invalid service');
                const settings = await this.organizationService.editServiceDetails(req.body.id, req.user.organization_id, req.user.role, req.body)
                if (!settings)
                    return ResponseFormatter.errorResponse(res, "Can't edit, try again later");
                return ResponseFormatter.successResponse(res, "Successfully updated service settings.");
            } else {
                const settings = await this.organizationService.addServiceDetails(req.user.organization_id, req.user.role, req.body)
                if (!settings)
                    return ResponseFormatter.errorResponse(res, "Can't add, try again later");
                return ResponseFormatter.successResponse(res, "Successfully added service settings.");
            }
        } catch (error: any) {
            return ResponseFormatter.errorResponse(res, error.message || 'An error occurred');
        }
    }

    @Get("/services")
    @UseBefore(authMiddleware)
    @UseBefore(organizationMiddleware)
    async getOrganizations(@Req() req: Request, @Res() res: Response) {
        try {
            const getOrganizationServices = await this.organizationService.getOrganizationsService(req.user.organization_id);
            const customResponse = await getOrganizationsServiceDetails(getOrganizationServices)
            return ResponseFormatter.successResponse(res, "Successful", customResponse);
        } catch (error: any) {
            return ResponseFormatter.errorResponse(res, error.message || 'An error occurred');
        }
    }

    @Get("/services/:serviceId")
    @UseBefore(authMiddleware)
    @UseBefore(organizationMiddleware)
    async getOrganizationsById(@Req() req: Request, @Res() res: Response, @Param("serviceId") serviceId: number ) {
        try {
            const checkValidService = await this.organizationService.checkIfValidOrganization(serviceId, req.user.organization_id);
            if (!checkValidService)
                return ResponseFormatter.errorResponse(res, "Not a valid service")
            const getOrganizationServices = await this.organizationService.getOrganizationsServiceById(serviceId);
            const customResponse = await getOrganizationsServiceDetails(getOrganizationServices)
            return ResponseFormatter.successResponse(res, "Successful", customResponse);
        } catch (error: any) {
            return ResponseFormatter.errorResponse(res, error.message || 'An error occurred');
        }
    }

    @Post("/services-settings")
    @UseBefore(authMiddleware)
    @UseBefore(organizationMiddleware)
    async addServiceSettings(@Req() req: Request, @Res() res: Response ) {
        try {
            if (!req.body) {
                return ResponseFormatter.errorResponse(res, 'Request body is undefined.');
            }
            const {error} = serviceSettingsSchema.validate(req.body);
            if (error) {
                return ResponseFormatter.errorResponse(res, error.details[0].message);
            }
            const checkIfValidService = await this.organizationService.checkIfValidOrganization(req.body.service_id, req.user.organization_id);
            if (!checkIfValidService)
                return ResponseFormatter.errorResponse(res, "Not a valid service");
            const checkIfServiceSettings = await this.organizationService.checkIfServiceSettingsExists(req.body.service_id);
            if (checkIfServiceSettings) {
                const editServiceSettings = await this.organizationService.editServiceSettings(req.body);
                if (!editServiceSettings)
                    return ResponseFormatter.errorResponse(res, "Can't edit, try again later");
                return ResponseFormatter.successResponse(res, "Successfully updated service settings.");
            } else {
                const addServiceSettings = await this.organizationService.addServiceSettings(req.body);
                if (!addServiceSettings)
                    return ResponseFormatter.errorResponse(res, "Can't add, try again later");
                return ResponseFormatter.successResponse(res, "Successfully added service settings.");
            }
        } catch (error: any) {
            return ResponseFormatter.errorResponse(res, error.message || 'An error occurred');
        }
    }

    @Get("/services-settings/:serviceId")
    @UseBefore(authMiddleware)
    @UseBefore(organizationMiddleware)
    async getServiceSettings(@Req() req: Request, @Res() res: Response, @Param("serviceId") serviceId: number) {
        try {
            const checkIfValidService = await this.organizationService.checkIfValidOrganization(serviceId, req.user.organization_id);
            if (!checkIfValidService)
                return ResponseFormatter.errorResponse(res, "Not a valid service");
            const getServiceSettings = await this.organizationService.getServiceSettingsById(serviceId);
            if (!getServiceSettings)
                return ResponseFormatter.errorResponse(res, "No service settings found");
            const getEmailReminders = await this.organizationService.getEmailRemindersByServiceId(serviceId);
            const customResponse = {
                id: getServiceSettings.id,
                service_id: getServiceSettings.service,
                available_slots: getServiceSettings.available_slots,
                service_manager: await this.organizationService.getServiceManager(getServiceSettings.service_manager),
                contact_email: getServiceSettings.contact_email,
                contact_phone: getServiceSettings.contact_phone,
                emailReminders: getEmailReminders.map((reminder: any) => {
                    return ({
                        id: reminder.id,
                        email: reminder.email,
                        day_of_week: reminder.day_of_week.map((day: string) => {
                                return {
                                    id: day,
                                    name: DaysOfWeek[parseInt(day)]
                                };
                            }
                        ),
                        time: reminder.time,
                        time_zone_id: reminder.time_zone,
                        time_zone: TimeZone[reminder.time_zone]
                    });
                })
            }
            return ResponseFormatter.successResponse(res, "Service settings", customResponse)
        } catch (error: any) {
            return ResponseFormatter.errorResponse(res, error.message || 'An error occurred');
        }
    }

    @Get("/details")
    @UseBefore(authMiddleware)
    @UseBefore(organizationMiddleware)
    async getOrganizationList(@Req() req: Request, @Res() res: Response) {
        try {
            const organization = await this.organizationService.getOrganizationsById(req.user.organization_id);
            const customResponse =await getOrganizationsDetails(organization);
            return ResponseFormatter.successResponse(res, "Organization list", customResponse)
        } catch (error: any) {
            return ResponseFormatter.errorResponse(res, error.message || 'An error occurred');
        }
    }

    @Post("/edit")
    @UseBefore(authMiddleware)
    @UseBefore(organizationMiddleware)
    @UseBefore(upload.array("affiliation_files", 10))
    async updateOrganizationDetails(@Req() req: Request, @Res() res: Response) {
        try {
            if (!req.body) {
                return ResponseFormatter.errorResponse(res, 'Request body is undefined.');
            }
            const {error} = organizationEditSchema.validate(req.body);
            if (error) {
                return ResponseFormatter.errorResponse(res, error.details[0].message);
            }
            const user = await this.userService.updateUser(req.user.organization_id, req.body, req.user.role);
            if (!user)
                return ResponseFormatter.successResponse(res, 'User not updated')
            return ResponseFormatter.successResponse(res, 'User updated')

        } catch (error: any) {
            return ResponseFormatter.errorResponse(res, error.message || 'An error occurred');
        }
    }

    @Post("/user-invitation")
    @UseBefore(authMiddleware)
    @UseBefore(organizationMiddleware)
    async sendInvitation(@Req() req: Request, @Res() res: Response) {
        try {
            if (!req.body) {
                return ResponseFormatter.errorResponse(res, 'Request body is undefined.');
            }
            const {error} = sendInvitationSchema.validate(req.body);
            if (error) {
                return ResponseFormatter.errorResponse(res, error.details[0].message);
            }

            const {email, role} = req.body

            const checkIfEmailAlreadyInUse = await this.organizationService.checkIfEmailAlreadyInUse(req.body.email)
            if (checkIfEmailAlreadyInUse)
                return ResponseFormatter.errorResponse(res, "Email already in use!");
            const sendUserInvitation = await this.organizationService.sendInvitation(email, role, req.user.organization_id, req.user.organization_name)
            if (!sendUserInvitation)
                return ResponseFormatter.errorResponse(res, "Invitation not sent");
            return ResponseFormatter.successResponse(res, "Invite successfully sent.  An email has been sent to the registered email ID.");
        } catch (error: any) {
            return ResponseFormatter.errorResponse(res, error.message || 'An error occurred');
        }
    }

    @Post("/user-invitation-resend")
    @UseBefore(authMiddleware)
    @UseBefore(organizationMiddleware)
    async resendInvitation(@Req() req: Request, @Res() res: Response) {
        try {
            if (!req.body) {
                return ResponseFormatter.errorResponse(res, 'Request body is undefined.');
            }
            const {error} = sendInvitationSchema.validate(req.body);
            if (error) {
                return ResponseFormatter.errorResponse(res, error.details[0].message);
            }

            const {email, role} = req.body

            const user = await this.organizationService.checkIfEmailAlreadyInUse(req.body.email)
            if (!user)
                return ResponseFormatter.errorResponse(res, "Email does not exist");
            if (user.is_active)
                return ResponseFormatter.successResponse(res, "User account already setup");
            const sendUserInvitation = await this.organizationService.resendInvitation(user.id, email, role, req.user.organization_id, req.user.organization_name)
            if (!sendUserInvitation)
                return ResponseFormatter.errorResponse(res, "Invitation not sent");
            return ResponseFormatter.successResponse(res, "Invite successfully resent.  An email has been sent to the registered email ID.");
        } catch (error: any) {
            return ResponseFormatter.errorResponse(res, error.message || 'An error occurred');
        }
    }

    @Get("/users")
    @UseBefore(authMiddleware)
    @UseBefore(organizationMiddleware)
    async getOrganizationUser(@Req() req: Request, @Res() res: Response) {
        try {
            const getUsers = await this.organizationService.getOrgUsers(req.user.organization_id);
            const customResponse = await Promise.all(
                getUsers.map(async (users: any) => {
                    return {
                        id: users.id,
                        first_name: users.first_name,
                        last_name: users.last_name,
                        email: users.email,
                        role_id: users.role.id,
                        role_name: users.role.name,
                    }
                })
            )
            return ResponseFormatter.successResponse(res, 'Users found', customResponse);
        }catch (error: any) {
            return ResponseFormatter.errorResponse(res, error.message || 'An error occurred');
        }
    }
}
