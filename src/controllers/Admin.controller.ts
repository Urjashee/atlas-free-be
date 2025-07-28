import {Get, JsonController, Param, Patch, Post, Req, Res, UseBefore} from "routing-controllers";
import {authMiddleware} from "../middleware/Auth.middleware";
import {adminMiddleware} from "../middleware/Admin.middleware";
import {ResponseFormatter} from "../helper/ResponseFormatter.helper";
import {Response, Request} from "express";
import {OrganizationService} from "../services/Organization.service";
import {Users} from "../entity/Users.entity";
import {ConfigService} from "../services/Config.service";
import {upload} from "../helper/MulterConfig.helper";
import Joi from "joi";
import {UserService} from "../services/User.service";
import {
    getOrganizationsDetails,
    getOrganizationsServiceDetails, getServiceRequestDetails,
    getServiceRequests,
    getUserDetails
} from "../util/Organization.util";
import {getRoleIdByName} from "../util/Common.util";
import {organizationMiddleware} from "../middleware/Organization.middleware";
import {reportSchema, sendInvitationSchema, serviceSettingsSchema} from "../schema/Organization.schema";
import {Constants} from "../helper/Constants.helper";
import {removeClient, removeUser} from "../schema/Admin.schema";
import {servicesSchema} from "../schema/Services.schema";
import {DaysOfWeek, TimeZone} from "../entity/EmailReminder.entity";
import {reportUser} from "../util/Common.util"

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
            const customResponse = await Promise.all(
                organizations.map(async (organization: any) => {
                    return await getOrganizationsDetails(organization);
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
            const user = await this.userService.updateUser(req.body.organization_id, req.body, req.user.role);
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

    @Get("/organization/:organization_id")
    @UseBefore(authMiddleware)
    @UseBefore(adminMiddleware)
    async getOrganizationDetails(@Req() req: Request, @Res() res: Response, @Param("organization_id") organization_id: number) {
        try {
            let customServices = [];
            let customUser = [];
            let roleId: number | undefined;
            const user = req.query.user as string;
            if (user == "all") {
                roleId = 0
            } else
                roleId = getRoleIdByName(user);
            console.log("role: ", roleId)
            const checkIfOrganization = await this.organizationService.checkIfOrganizationIsAvailable(organization_id);
            if (!checkIfOrganization)
                return ResponseFormatter.errorResponse(res, 'Not an organization');

            const organizationDetails = await getOrganizationsDetails(checkIfOrganization);
            const getServices = await this.organizationService.getOrganizationServices(organization_id);

            const getUsers = await this.organizationService.getUserByOrganization(organization_id, roleId);
            for (const user of getUsers) {
                const data = await getUserDetails(user);
                customUser.push(data);
            }


            for (const service of getServices) {
                const data = await getOrganizationsServiceDetails(service)
                customServices.push(data)
            }

            const customResponse = {
                organization: organizationDetails,
                services: customServices,
                users: customUser
            }
            return ResponseFormatter.successResponse(res, 'Status updated', customResponse);

        } catch (error: any) {
            return ResponseFormatter.errorResponse(res, error.message || 'An error occurred');
        }
    }

    @Post("/user-invitation")
    @UseBefore(authMiddleware)
    @UseBefore(adminMiddleware)
    async sendInvitation(@Req() req: Request, @Res() res: Response) {
        try {
            if (!req.body) {
                return ResponseFormatter.errorResponse(res, 'Request body is undefined.');
            }
            const {error} = sendInvitationSchema.validate(req.body);
            if (error) {
                return ResponseFormatter.errorResponse(res, error.details[0].message);
            }

            const {email, role, organization_id} = req.body

            const checkIfEmailAlreadyInUse = await this.organizationService.checkIfEmailAlreadyInUse(req.body.email)
            if (checkIfEmailAlreadyInUse)
                return ResponseFormatter.errorResponse(res, "Email already in use!");
            const checkIfOrganization = await this.organizationService.checkIfOrganization(organization_id);
            if (!checkIfOrganization)
                return ResponseFormatter.errorResponse(res, "Invalid organization");
            const sendUserInvitation = await this.organizationService.sendInvitation(email, role, organization_id, checkIfOrganization.name)
            if (!sendUserInvitation)
                return ResponseFormatter.errorResponse(res, "Invitation not sent");
            return ResponseFormatter.successResponse(res, "Invite successfully sent.  An email has been sent to the registered email ID.");
        } catch (error: any) {
            return ResponseFormatter.errorResponse(res, error.message || 'An error occurred');
        }
    }

    @Post("/user-invitation-resend")
    @UseBefore(authMiddleware)
    @UseBefore(adminMiddleware)
    async resendInvitation(@Req() req: Request, @Res() res: Response) {
        try {
            if (!req.body) {
                return ResponseFormatter.errorResponse(res, 'Request body is undefined.');
            }
            const {error} = sendInvitationSchema.validate(req.body);
            if (error) {
                return ResponseFormatter.errorResponse(res, error.details[0].message);
            }

            const {email, role, organization_id} = req.body

            const user = await this.organizationService.checkIfEmailAlreadyInUse(req.body.email)
            if (!user)
                return ResponseFormatter.errorResponse(res, "Email does not exist");
            if (user.is_active)
                return ResponseFormatter.successResponse(res, "User account already setup");
            const checkIfOrganization = await this.organizationService.checkIfOrganization(organization_id);
            if (!checkIfOrganization)
                return ResponseFormatter.errorResponse(res, "Invalid organization");
            const sendUserInvitation = await this.organizationService.resendInvitation(user.id, email, role, organization_id, checkIfOrganization.name)
            if (!sendUserInvitation)
                return ResponseFormatter.errorResponse(res, "Invitation not sent");
            return ResponseFormatter.successResponse(res, "Invite successfully resent.  An email has been sent to the registered email ID.");
        } catch (error: any) {
            return ResponseFormatter.errorResponse(res, error.message || 'An error occurred');
        }
    }

    @Get("/organization/users/:organizationId")
    @UseBefore(authMiddleware)
    @UseBefore(adminMiddleware)
    async getOrganizationUser(@Req() req: Request, @Res() res: Response, @Param("organizationId") organization_id: number) {
        try {
            const getUsers = await this.organizationService.getOrgUsers(organization_id);
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
        } catch (error: any) {
            return ResponseFormatter.errorResponse(res, error.message || 'An error occurred');
        }
    }

    @Get("/organization/user-details/:organizationId/:userId")
    @UseBefore(authMiddleware)
    @UseBefore(adminMiddleware)
    async getOrganizationUserDetails(@Req() req: Request, @Res() res: Response, @Param("organizationId") organization_id: number, @Param("userId") user_id: number) {
        try {
            const checkIfOrganizationUser = await this.organizationService.checkIfOrganizationUser(user_id, organization_id);
            const User = await getUserDetails(checkIfOrganizationUser);
            return ResponseFormatter.successResponse(res, 'Users found', User);
        } catch (error: any) {
            return ResponseFormatter.errorResponse(res, error.message || 'An error occurred');
        }
    }

    @Post("/organization/remove-user-service")
    @UseBefore(authMiddleware)
    @UseBefore(adminMiddleware)
    async removeUserService(@Req() req: Request, @Res() res: Response) {
        try {
            if (!req.body) {
                return ResponseFormatter.errorResponse(res, 'Request body is undefined.');
            }
            const {error} = removeUser.validate(req.body);
            if (error) {
                return ResponseFormatter.errorResponse(res, error.details[0].message);
            }
            const {organization_id, user_id, service_id} = req.body
            const checkIfServiceManager = await this.organizationService.checkIfOrganizationUser(user_id, organization_id);
            if (!checkIfServiceManager) {
                return ResponseFormatter.errorResponse(res, 'User not found in organization');
            }
            if (checkIfServiceManager.role.id != Constants.ROLE_SERVICE_MANAGER) {
                return ResponseFormatter.errorResponse(res, 'Not a service Manager');
            }
            const checkIfServiceInOrganization = await this.organizationService.checkIfServiceInOrganization(service_id, organization_id);
            if (!checkIfServiceInOrganization) {
                return ResponseFormatter.errorResponse(res, 'Service not found in organization');
            }
            const checkIfUserInService = await this.organizationService.checkIfUserInService(user_id, service_id);
            if (!checkIfUserInService) {
                return ResponseFormatter.errorResponse(res, 'User not assigned to this service');
            }
            // const checkIfEmail = await this.organizationService.checkIfEmailIsServiceManager(email, user_id, organization_id);
            // if (!checkIfEmail) {
            //     return ResponseFormatter.errorResponse(res, 'Email provided is not a service manager');
            // }
            const removeUserService = await this.organizationService.removeUserFromService(user_id, service_id);
            if (!removeUserService) {
                return ResponseFormatter.errorResponse(res, 'Failed to remove user from service');
            }
            return ResponseFormatter.successResponse(res, 'Service Removed from user successfully');
        } catch (error: any) {
            return ResponseFormatter.errorResponse(res, error.message || 'An error occurred');
        }
    }

    @Post("/organization/remove-client")
    @UseBefore(authMiddleware)
    @UseBefore(adminMiddleware)
    async removeClient(@Req() req: Request, @Res() res: Response) {
        try {
            if (!req.body) {
                return ResponseFormatter.errorResponse(res, 'Request body is undefined.');
            }
            const {error} = removeClient.validate(req.body);
            if (error) {
                return ResponseFormatter.errorResponse(res, error.details[0].message);
            }
            const {organization_id, user_id, client_id, role_id} = req.body
            const checkIfServiceManager = await this.organizationService.checkIfOrganizationUser(user_id, organization_id);
            if (!checkIfServiceManager) {
                return ResponseFormatter.errorResponse(res, 'User not found in organization');
            }
            if (checkIfServiceManager.role.id != role_id)
                return ResponseFormatter.errorResponse(res, 'Not a valid user type');
            const checkIfClientCreatedByUser = await this.organizationService.checkIfClientCreatedByUser(client_id, user_id);
            if (!checkIfClientCreatedByUser) {
                return ResponseFormatter.errorResponse(res, 'Client not created by this user');
            }
            const removeUserClient = await this.organizationService.removeUserClient(client_id)
            if (!removeUserClient) {
                return ResponseFormatter.errorResponse(res, 'Failed to remove client');
            }
            return ResponseFormatter.successResponse(res, 'Service Removed from user successfully');
        } catch (error: any) {
            return ResponseFormatter.errorResponse(res, error.message || 'An error occurred');
        }
    }

//     Remove service manager

//     Remove advocate

//     Remove org admin

    @Post("/organization/services")
    @UseBefore(authMiddleware)
    @UseBefore(adminMiddleware)
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
                const checkIfValidOrganization = await this.organizationService.checkIfValidOrganization(req.body.id, req.body.organization_id);
                if (!checkIfValidOrganization)
                    return ResponseFormatter.errorResponse(res, 'Invalid service');
                const settings = await this.organizationService.editServiceDetails(req.body.id, req.body.organization_id, req.user.role, req.body)
                if (!settings)
                    return ResponseFormatter.errorResponse(res, "Can't edit, try again later");
                return ResponseFormatter.successResponse(res, "Successfully updated service settings.");
            } else {
                const settings = await this.organizationService.addServiceDetails(req.body.organization_id, req.user.role, req.body, req.user.id)
                if (!settings)
                    return ResponseFormatter.errorResponse(res, "Can't add, try again later");
                return ResponseFormatter.successResponse(res, "Successfully added service.");
            }
        } catch (error: any) {
            return ResponseFormatter.errorResponse(res, error.message || 'An error occurred');
        }
    }


    @Get("/organization/services/:organizationId")
    @UseBefore(authMiddleware)
    @UseBefore(adminMiddleware)
    async getOrganizations(@Req() req: Request, @Res() res: Response, @Param("organizationId") organizationId: number) {
        try {
            let customResponse = [];
            const getOrganizationServices = await this.organizationService.getOrganizationsService(organizationId);
            for (const service of getOrganizationServices) {
                const data = await getOrganizationsServiceDetails(service)
                customResponse.push(data)
            }
            return ResponseFormatter.successResponse(res, "Successful", customResponse);
        } catch (error: any) {
            return ResponseFormatter.errorResponse(res, error.message || 'An error occurred');
        }
    }

    @Get("/organization/services/:organizationId/:serviceId")
    @UseBefore(authMiddleware)
    @UseBefore(adminMiddleware)
    async getOrganizationsById(@Req() req: Request, @Res() res: Response, @Param("serviceId") serviceId: number, @Param("organizationId") organizationId: number) {
        try {
            const checkValidService = await this.organizationService.checkIfValidOrganization(serviceId, organizationId);
            if (!checkValidService)
                return ResponseFormatter.errorResponse(res, "Not a valid service")
            const getOrganizationServices = await this.organizationService.getOrganizationsServiceById(serviceId);
            const customResponse = await getOrganizationsServiceDetails(getOrganizationServices)
            return ResponseFormatter.successResponse(res, "Successful", customResponse);
        } catch (error: any) {
            return ResponseFormatter.errorResponse(res, error.message || 'An error occurred');
        }
    }

    @Post("/organization/services-settings")
    @UseBefore(authMiddleware)
    @UseBefore(adminMiddleware)
    async addServiceSettings(@Req() req: Request, @Res() res: Response) {
        try {
            if (!req.body) {
                return ResponseFormatter.errorResponse(res, 'Request body is undefined.');
            }
            const {error} = serviceSettingsSchema.validate(req.body);
            if (error) {
                return ResponseFormatter.errorResponse(res, error.details[0].message);
            }
            const checkIfValidService = await this.organizationService.checkIfValidOrganization(req.body.service_id, req.body.organization_id);
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

    @Get("/organization/services-settings/:organizationId/:serviceId")
    @UseBefore(authMiddleware)
    @UseBefore(adminMiddleware)
    async getServiceSettings(@Req() req: Request, @Res() res: Response, @Param("serviceId") serviceId: number, @Param("organizationId") organizationId: number) {
        try {
            const checkIfValidService = await this.organizationService.checkIfValidOrganization(serviceId, organizationId);
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

    @Get("/organization/service-requests/:organizationId")
    @UseBefore(authMiddleware)
    @UseBefore(adminMiddleware)
    async getServiceRequest(@Req() req: Request, @Res() res: Response, @Param("organizationId") organizationId: number) {
        try {
            const page_number = parseInt(req.query.page_number as string) || Constants.PAGE_NUMBER;
            const page_size = parseInt(req.query.page_size as string) || Constants.PAGE_SIZE;
            const status = parseInt(req.query.status as string);
            const getServiceRequestsData = await getServiceRequests(organizationId, page_number, page_size, status);
            return ResponseFormatter.successResponse(res, "Successful", getServiceRequestsData);
        } catch (error: any) {
            return ResponseFormatter.errorResponse(res, error.message || 'An error occurred');
        }
    }

    @Get("/organization/service-requests/:organizationId/:serviceRequestsId")
    @UseBefore(authMiddleware)
    @UseBefore(adminMiddleware)
    async getServiceRequestsId(@Req() req: Request, @Res() res: Response, @Param("organizationId") organizationId: number, @Param("serviceRequestsId") serviceRequestsId: number) {
        try {
            const checkIfServiceRequest = await this.organizationService.checkIfServiceRequestExists(organizationId, serviceRequestsId);
            if (!checkIfServiceRequest)
                return ResponseFormatter.errorResponse(res, "Not a valid service request");
            const customResponse = await getServiceRequestDetails(serviceRequestsId)
            return ResponseFormatter.successResponse(res, "Successful", customResponse);
        } catch (error: any) {
            return ResponseFormatter.errorResponse(res, error.message || 'An error occurred');
        }
    }

    @Post("/organization/report-user")
    @UseBefore(authMiddleware)
    @UseBefore(adminMiddleware)
    async reportUser(@Req() req: Request, @Res() res: Response) {
        try {
            if (!req.body) {
                return ResponseFormatter.errorResponse(res, 'Request body is undefined.');
            }
            const {error} = reportSchema.validate(req.body);
            if (error) {
                return ResponseFormatter.errorResponse(res, error.details[0].message);
            }
            await reportUser(req.body, req.user.id, req.user.organization_id);
            return ResponseFormatter.successResponse(res, 'Users reported');
        } catch (error: any) {
            return ResponseFormatter.errorResponse(res, error.message || 'An error occurred');
        }
    }
}
