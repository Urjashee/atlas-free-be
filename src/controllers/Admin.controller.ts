import {Delete, Get, JsonController, Param, Patch, Post, Req, Res, UseBefore} from "routing-controllers";
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
    getUserDetails, removeOrganizationUser
} from "../util/Organization.util";
import {getRoleIdByName} from "../util/Common.util";
import {organizationMiddleware} from "../middleware/Organization.middleware";
import {
    assignServiceSchema,
    reportSchema,
    sendInvitationSchema,
    serviceSettingsSchema
} from "../schema/Organization.schema";
import {Constants} from "../helper/Constants.helper";
import {removeClient, removeUser} from "../schema/Admin.schema";
import {clientServiceSchema, removeUserSchema, servicesSchema} from "../schema/Services.schema";
import {DaysOfWeek, TimeZone} from "../entity/EmailReminder.entity";
import {reportUser} from "../util/Common.util"
import {ClientService} from "../services/Client.service";
import {clientSchema} from "../schema/Client.schema";
import {getClientDetails} from "../util/Advocate.util";
import {clients, getClientsById} from "../util/ServiceRequest.util";
import {AdvocateService} from "../services/Advocate.service";
import {addClientService} from "../util/Common.util"
import {AnalyticsService} from "../services/Analytics.service";

const adminOrgEditSchema = Joi.object({
    organization_id: Joi.number().required(),
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
    ein: Joi.string().optional().allow(""),
    primary_purpose: Joi.array().items(Joi.number()).required(),
    affiliations: Joi.string().optional(),
});

@JsonController("/api/admin")

export class AdminController {
    private organizationService = new OrganizationService();
    private userService = new UserService();
    private clientService = new ClientService();
    private analyticService = new AnalyticsService();

    @Get("/organization/list/:filter")
    @UseBefore(authMiddleware)
    @UseBefore(adminMiddleware)
    async getOrganizationList(@Req() req: Request, @Res() res: Response, @Param("filter") filter: string) {
        try {
            const organizations = await this.organizationService.getOrganizations(filter)
            const customResponse = await Promise.all(
                organizations.map(async (organization: any) => {
                    return await getOrganizationsDetails(organization, filter, Constants.ROLE_ADMIN);
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

    @Patch("/organization/status/:organization_id/:status_id")
    @UseBefore(authMiddleware)
    @UseBefore(adminMiddleware)
    async updateOrganizationStatus(@Req() req: Request, @Res() res: Response, @Param("organization_id") organization_id: number, @Param("status_id") status_id: number) {
        try {
            const organization = await this.organizationService.updateStatus(organization_id, status_id)
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
            let filter: string;
            const user = req.query.user as string;
            if (user == "all") {
                roleId = 0
            } else
                roleId = getRoleIdByName(user);
            console.log("role: ", roleId)
            const checkIfOrganization = await this.organizationService.checkIfOrganizationIsAvailable(organization_id);
            if (!checkIfOrganization)
                return ResponseFormatter.errorResponse(res, 'Not an organization');

            if (checkIfOrganization.organization.is_active == true && checkIfOrganization.organization.under_review == false) {
                filter = "active";
            }
            if (checkIfOrganization.organization.is_active == true && checkIfOrganization.organization.under_review == true) {
                filter = "pending";
            }
            if (checkIfOrganization.organization.is_active == false && checkIfOrganization.organization.under_review == false) {
                filter = "inactive";
            }

            const organizationDetails = await getOrganizationsDetails(checkIfOrganization, filter, Constants.ROLE_ADMIN);
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

    @Post("/organization/user-invitation")
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

    @Post("/organization/user-invitation-resend")
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
                        role_name: users.role.name == 'organization' ? 'Organization Admin' : users.role.name == 'service_manager' ? 'Service Manager' : users.role.name == 'advocate' ? 'Advocate' : users.role.name,
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
            if (!checkIfOrganizationUser)
                return ResponseFormatter.errorResponse(res, 'User not found in organization');
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
    @Post("/organization/remove/service-manager")
    @UseBefore(authMiddleware)
    @UseBefore(adminMiddleware)
    async removeServiceManager(@Req() req: Request, @Res() res: Response) {
        try {
            if (!req.body) {
                return ResponseFormatter.errorResponse(res, 'Request body is undefined.');
            }
            const {error} = removeUserSchema.validate(req.body);
            if (error) {
                return ResponseFormatter.errorResponse(res, error.details[0].message);
            }
            const {organization_id, user_id, email} = req.body;

            await removeOrganizationUser(organization_id, user_id, email, req.user.id, Constants.ROLE_SERVICE_MANAGER);

            return ResponseFormatter.successResponse(res, 'Service manager deleted');

        } catch (error: any) {
            return ResponseFormatter.errorResponse(res, error.message || 'An error occurred');
        }
    }

    //     Remove advocate
    @Post("/organization/remove/advocate")
    @UseBefore(authMiddleware)
    @UseBefore(adminMiddleware)
    async removeAdvocate(@Req() req: Request, @Res() res: Response) {
        try {
            if (!req.body) {
                return ResponseFormatter.errorResponse(res, 'Request body is undefined.');
            }
            const {error} = removeUserSchema.validate(req.body);
            if (error) {
                return ResponseFormatter.errorResponse(res, error.details[0].message);
            }
            const {organization_id, user_id, email} = req.body;

            await removeOrganizationUser(organization_id, user_id, email, req.user.id, Constants.ROLE_ADVOCATE);

            return ResponseFormatter.successResponse(res, 'Advocate deleted');
        } catch (error: any) {
            return ResponseFormatter.errorResponse(res, error.message || 'An error occurred');
        }
    }

    //     Remove org admin
    @Post("/organization/remove/organization-admin")
    @UseBefore(authMiddleware)
    @UseBefore(adminMiddleware)
    async removeOrganizationAdmin(@Req() req: Request, @Res() res: Response) {
        try {
            if (!req.body) {
                return ResponseFormatter.errorResponse(res, 'Request body is undefined.');
            }
            const {error} = removeUserSchema.validate(req.body);
            if (error) {
                return ResponseFormatter.errorResponse(res, error.details[0].message);
            }
            const {organization_id, user_id, email} = req.body;

            await removeOrganizationUser(organization_id, user_id, email, req.user.id, Constants.ROLE_ORGANIZATION_ADMIN);

            return ResponseFormatter.successResponse(res, 'Organization admin deleted');
        } catch (error: any) {
            return ResponseFormatter.errorResponse(res, error.message || 'An error occurred');
        }
    }

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

    @Delete("/organization/service-delete/:organizationId/:serviceId")
    @UseBefore(authMiddleware)
    @UseBefore(organizationMiddleware)
    async serviceDelete(@Req() req: Request, @Res() res: Response, @Param("organizationId") organizationId: number, @Param("serviceId") serviceId: number) {
        try {
            const checkValidService = await this.organizationService.checkIfValidOrganization(serviceId, organizationId);
            if (!checkValidService)
                return ResponseFormatter.errorResponse(res, "Not a valid service")
            // remove assigned service
            const removeAssignedService = await this.organizationService.removeAssignedService(serviceId);
            if (!removeAssignedService)
                return ResponseFormatter.errorResponse(res, "Can't remove assigned service, try again later");
            // remove service settings
            const removeServiceSettings = await this.organizationService.removeServiceSettings(serviceId);
            if (!removeServiceSettings)
                return ResponseFormatter.errorResponse(res, "Can't remove service settings, try again later");
            // remove service
            const removeService = await this.organizationService.removeService(serviceId);
            if (!removeService)
                return ResponseFormatter.errorResponse(res, "Can't remove service, try again later");

            return ResponseFormatter.successResponse(res, "Successful");
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
            const checkIfServiceSettings = await this.organizationService.checkIfServiceExists(req.body.service_id);
            if (!checkIfServiceSettings)
                return ResponseFormatter.errorResponse(res, "Service not found");
            else if (checkIfServiceSettings) {
                const editServiceSettings = await this.organizationService.editServiceSettings(req.body);
                if (!editServiceSettings)
                    return ResponseFormatter.errorResponse(res, "Can't edit, try again later");
                return ResponseFormatter.successResponse(res, "Successfully updated service settings.");
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
                service_id: getServiceSettings.id,
                available_slots: getServiceSettings.slots_available,
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
            await reportUser(req.body, req.user.id, req.body.organization_id);
            return ResponseFormatter.successResponse(res, 'Users reported');
        } catch (error: any) {
            return ResponseFormatter.errorResponse(res, error.message || 'An error occurred');
        }
    }

    @Patch("/organization/service-requests/:organizationId/:serviceRequestsId/:status")
    @UseBefore(authMiddleware)
    @UseBefore(adminMiddleware)
    async changeServiceRequestStatus(@Req() req: Request, @Res() res: Response, @Param("organizationId") organizationId: number, @Param("serviceRequestsId") serviceRequestsId: number, @Param("status") status: number) {
        try {
            const checkIfServiceRequest = await this.organizationService.checkIfServiceRequestExists(organizationId, serviceRequestsId);
            if (!checkIfServiceRequest)
                return ResponseFormatter.errorResponse(res, "Not a valid service request");
            const getServiceRequest = await this.clientService.getServiceRequestById(serviceRequestsId);
            if (!getServiceRequest) {
                return ResponseFormatter.errorResponse(res, "Service request not found");
            }
            const updatedAssignedServiceStatus = await this.clientService.updateServiceRequestStatus(serviceRequestsId, status);
            if (!updatedAssignedServiceStatus)
                return ResponseFormatter.errorResponse(res, "Failed to update service request status");
            return ResponseFormatter.successResponse(res, "Successfully updated service request status");
        } catch (error: any) {
            return ResponseFormatter.errorResponse(res, error.message || 'An error occurred');
        }
    }

    @Post("/organization/clients")
    @UseBefore(authMiddleware)
    @UseBefore(adminMiddleware)
    async addClient(@Req() req: Request, @Res() res: Response) {
        try {
            if (!req.body) {
                return ResponseFormatter.errorResponse(res, 'Request body is undefined.');
            }
            const {error} = clientSchema.validate(req.body);
            if (error) {
                return ResponseFormatter.errorResponse(res, error.details[0].message);
            }
            const addEditClient = await clients(req.body, req.user.id, req.body.organization_id);
            return ResponseFormatter.successResponse(res, `${addEditClient}`);

        } catch (error: any) {
            return ResponseFormatter.errorResponse(res, error.message || 'An error occurred');
        }
    }

    @Get("/organization/clients/:organizationId")
    @UseBefore(authMiddleware)
    @UseBefore(adminMiddleware)
    async getClients(@Req() req: Request, @Res() res: Response, @Param("organizationId") organizationId: number) {
        try {
            const getClients = await this.organizationService.getClientsByOrganization(organizationId);
            const customResponse = await getClientDetails(getClients, Constants.ROLE_ADVOCATE)
            return ResponseFormatter.successResponse(res, "Successful", customResponse);
        } catch (error: any) {
            return ResponseFormatter.errorResponse(res, error.message || 'An error occurred');
        }
    }

    @Get("/organization/clients/:organizationId/:clientId")
    @UseBefore(authMiddleware)
    @UseBefore(adminMiddleware)
    async getClientsById(@Req() req: Request, @Res() res: Response, @Param("organizationId") organizationId: number, @Param("clientId") clientId: number) {
        try {
            const checkIfOrganizationClientExists = await this.organizationService.checkIfOrganizationClientExists(organizationId, clientId);
            if (!checkIfOrganizationClientExists) {
                return ResponseFormatter.errorResponse(res, "Not a valid client");
            }
            const customResponse = await getClientsById(clientId, req.user.id, organizationId);
            return ResponseFormatter.successResponse(res, "Successful", customResponse);
        } catch (error: any) {
            return ResponseFormatter.errorResponse(res, error.message || 'An error occurred');
        }
    }

    //
    @Post("/organization/service-request/add")
    @UseBefore(authMiddleware)
    @UseBefore(organizationMiddleware)
    async addClientService(@Req() req: Request, @Res() res: Response) {
        try {
            if (!req.body) {
                return ResponseFormatter.errorResponse(res, 'Request body is undefined.');
            }
            const {error} = clientServiceSchema.validate(req.body);
            if (error) {
                return ResponseFormatter.errorResponse(res, error.details[0].message);
            }
            await addClientService(req.body, req.user.role.id)
            return ResponseFormatter.successResponse(res, "Successful");
        } catch (error: any) {
            return ResponseFormatter.errorResponse(res, error.message || 'An error occurred');
        }
    }

    @Post("/assign-service/:assign")
    @UseBefore(authMiddleware)
    @UseBefore(adminMiddleware)
    async assignService(@Req() req: Request, @Res() res: Response, @Param("assign") assign: string) {
        try {
            if (!req.body) {
                return ResponseFormatter.errorResponse(res, 'Request body is undefined.');
            }
            const {error} = assignServiceSchema.validate(req.body);
            if (error) {
                return ResponseFormatter.errorResponse(res, error.details[0].message);
            }

            const {service_id, service_manager_id, organization_id} = req.body;

            const checkIfValidService = await this.organizationService.checkIfValidOrganization(service_id, organization_id);
            if (!checkIfValidService)
                return ResponseFormatter.errorResponse(res, "Not a valid service");

            const checkIfService = await this.organizationService.checkIfServiceExists(req.body.service_id);
            if (!checkIfService)
                return ResponseFormatter.errorResponse(res, "Service not found");
            const checkIfServiceManager = await this.userService.checkIfServiceManager(service_manager_id)
            if (!checkIfServiceManager)
                return ResponseFormatter.errorResponse(res, "No service manager found");
            const getServiceManager = await this.organizationService.getServiceManager(checkIfValidService.service_manager)

            if (assign === "assign") {
                const assignManager = await this.organizationService.assignServiceToManager(service_manager_id, checkIfValidService);
                if (!assignManager)
                    return ResponseFormatter.errorResponse(res, "Service manager not assigned");
            }
            if (assign === "remove") {
                const removeManager = await this.organizationService.removeServiceFromManager(service_manager_id, checkIfValidService);
                if (!removeManager)
                    return ResponseFormatter.errorResponse(res, "Service manager not assigned");
            }

            return ResponseFormatter.successResponse(res, "Successful updated");

        } catch (error: any) {
            return ResponseFormatter.errorResponse(res, error.message || 'An error occurred');
        }
    }

    @Get("/analytics")
    @UseBefore(authMiddleware)
    @UseBefore(adminMiddleware)
    async getAnalytics(@Req() req: Request, @Res() res: Response) {
        try {
            const from_date = req.query.from_date as string | undefined;
            const to_date = req.query.to_date as string | undefined;

            if ((from_date && !to_date) || (!from_date && to_date)) {
                return ResponseFormatter.errorResponse(
                    res,
                    "from_date and to_date must be provided together"
                );
            }

            const totalOrganizations = await this.analyticService.getOrganizationCount(from_date, to_date);
            const totalServices = await this.analyticService.getServiceCount(from_date, to_date);
            const totalAdvocate = await this.analyticService.getUserCount(Constants.ROLE_ADVOCATE, from_date, to_date);
            const totalSurvivor = await this.analyticService.getUserCount(Constants.ROLE_SURVIVOR, from_date, to_date);
            const totalServiceRequest = await this.analyticService.getServiceRequestCount(null, from_date, to_date);
            const serviceRequestPending = await this.analyticService.getServiceRequestCount(Constants.PENDING, from_date, to_date);
            const serviceRequestPlaced = await this.analyticService.getServiceRequestCount(Constants.PLACED, from_date, to_date);
            const serviceRequestUnableToServed = await this.analyticService.getServiceRequestCount(Constants.UNABLE_TO_SERVE, from_date, to_date);
            const serviceRequestWaitlisted = await this.analyticService.getServiceRequestCount(Constants.WAITLISTED, from_date, to_date);
            const serviceRequestCancelled = await this.analyticService.getServiceRequestCount(Constants.CANCELLED, from_date, to_date);
            const serviceRequestAccepted = await this.analyticService.getServiceRequestCount(Constants.ACCEPTED, from_date, to_date);
            const serviceRequestDemo = await this.analyticService.getServiceRequestDemo(from_date, to_date);
            const serviceRequestSpeakingAbilityDemo = await this.analyticService.getEnglishSpeakingAbilityDistribution(from_date, to_date);
            const serviceRequestGenderDemo = await this.analyticService.getGenderDistribution(from_date, to_date);
            const serviceRequestCitizenshipStatusDemo = await this.analyticService.getCitizenshipStatusDistribution(from_date, to_date);
            const serviceRequestClientExperienceDemo = await this.analyticService.getClientExperienceDistribution(from_date, to_date);
            const serviceRequestPregnantDemo = await this.analyticService.getPregnancyDistribution(from_date, to_date);
            const serviceChildrenAccompanyDemo = "";
            const serviceBirthdateDemo = await this.analyticService.getBirthdateDistribution(from_date, to_date);
            const serviceCriteriaDemo = await this.analyticService.getCriteriaDistribution(from_date, to_date);
            const organizationServiceStatus = await this.analyticService.getServicesByStatus(from_date, to_date);
            const organizationServiceModel = await this.analyticService.getServicesByServiceModel(from_date, to_date);
            const organizationSlotsBeds = await this.analyticService.getServicesBySlotsBeds(from_date, to_date);
            const organizationGendersServed = await this.analyticService.getServicesByGenderServed(from_date, to_date);
            const organizationServedTo = await this.analyticService.getServicesByServedTo(from_date, to_date);
            const organizationCitizenshipRequirements = await this.analyticService.getServicesByCitizenshipRequirements(from_date, to_date);
            const organizationLanguageRequirements = await this.analyticService.getServicesByLanguageRequirements(from_date, to_date);
            const organizationTrafficking = await this.analyticService.getServicesByTraffickingStatus(from_date, to_date);
            const organizationLegal = await this.analyticService.getServicesByLegal(from_date, to_date);
            const organizationHealthNeeds = await this.analyticService.getServicesByHealthNeeds(from_date, to_date);
            const organizationMedication = await this.analyticService.getServicesByMedications(from_date, to_date);
            const organizationMentalHealth = await this.analyticService.getServicesByMentalHealth(from_date, to_date);
            const organizationPhysicalAccommodations = await this.analyticService.getServicesByPhysicalAccommodations(from_date, to_date);
            const organizationEntryRequirements = await this.analyticService.getServicesByEntryRequirements(from_date, to_date);
            const organizationFaithEngagement = await this.analyticService.getServicesByFaithEngagement(from_date, to_date);
            const organizationServiceStructure = await this.analyticService.getServicesByServiceStructure(from_date, to_date);
            const organizationSleepingArrangement = await this.analyticService.getServicesBySleepingArrangement(from_date, to_date);
            const organizationStaffingLevel = await this.analyticService.getServicesByStaffingLevel(from_date, to_date);
            const organizationTeamDiversity = await this.analyticService.getServicesByTeamDiversity(from_date, to_date);
            const organizationServiceGuidelines = await this.analyticService.getServicesByServiceGuidelines(from_date, to_date);


            const customResponse = {
                app_engagement: {
                    total_organization: totalOrganizations,
                    total_services: totalServices,
                    total_advocate: totalAdvocate,
                    total_survivor: totalSurvivor,
                    total_service_requests: totalServiceRequest,
                    service_requests_pending: serviceRequestPending,
                    service_requests_placed: serviceRequestPlaced,
                    service_requests_unable_to_serve: serviceRequestUnableToServed,
                    service_requests_waitlisted: serviceRequestWaitlisted,
                    service_requests_cancelled: serviceRequestCancelled,
                    service_requests_accepted: serviceRequestAccepted,
                },
                survivor_demographics: {
                    service_requests_demographics: serviceRequestDemo,
                    speaking_ability_demographics: serviceRequestSpeakingAbilityDemo,
                    gender_demographics: serviceRequestGenderDemo,
                    citizenship_status_demographics: serviceRequestCitizenshipStatusDemo,
                    client_experience_demographics: serviceRequestClientExperienceDemo,
                    pregnancy_demographics: serviceRequestPregnantDemo,
                    children_accompany: serviceChildrenAccompanyDemo,
                    birthdate_status_demographics: serviceBirthdateDemo,
                    client_criteria_demographics: serviceCriteriaDemo,
                },
                organization: {
                    service_status: organizationServiceStatus,
                    service_model: organizationServiceModel,
                    slots_beds: organizationSlotsBeds,
                    genders_served: organizationGendersServed,
                    served_to: organizationServedTo,
                    citizenship_requirement: organizationCitizenshipRequirements,
                    language_requirement: organizationLanguageRequirements,
                    trafficking_status: organizationTrafficking,
                    legal: organizationLegal,
                    health_needs: organizationHealthNeeds,
                    medication: organizationMedication,
                    mental_health_diagnoses: organizationMentalHealth,
                    physical_accommodation: organizationPhysicalAccommodations,
                    entry_requirement: organizationEntryRequirements,
                    faith_engagement: organizationFaithEngagement,
                    service_structure: organizationServiceStructure,
                    sleeping_arrangement: organizationSleepingArrangement,
                    staffing_level: organizationStaffingLevel,
                    team_diversity: organizationTeamDiversity,
                    service_guidelines: organizationServiceGuidelines,
                }
            };

            return ResponseFormatter.successResponse(
                res,
                "Analytics fetched successfully",
                customResponse
            );

        } catch (error: any) {
            return ResponseFormatter.errorResponse(
                res,
                error.message || "An error occurred"
            );
        }
    }

    @Get("/organization/details/:organizationId")
    @UseBefore(authMiddleware)
    @UseBefore(adminMiddleware)
    async getOrganizationById(@Req() req: Request, @Res() res: Response, @Param("organizationId") organizationId: number) {
        try {
            const organization = await this.organizationService.getOrganizationsById(organizationId);
            const customResponse = await getOrganizationsDetails(organization);
            return ResponseFormatter.successResponse(res, "Organization list", customResponse)
        } catch (error: any) {
            return ResponseFormatter.errorResponse(res, error.message || 'An error occurred');
        }
    }

}
