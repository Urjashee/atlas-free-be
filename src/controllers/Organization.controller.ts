import {Get, JsonController, Param, Patch, Post, Req, Res, UseBefore} from "routing-controllers";
import {UserService} from "../services/User.service";
import {OrganizationService} from "../services/Organization.service";
import {ConfigService} from "../services/Config.service";
import {authMiddleware} from "../middleware/Auth.middleware";
import {Request, Response} from "express";
import {ResponseFormatter} from "../helper/ResponseFormatter.helper";
import Joi from "joi";
import {organizationMiddleware} from "../middleware/Organization.middleware";
import {
    getOrganizationsDetails,
    getOrganizationsServiceDetails,
    getServiceRequestDetails,
    getServiceRequests
} from "../util/Organization.util";
import {upload} from "../helper/MulterConfig.helper";
import {clientServiceSchema, servicesSchema} from "../schema/Services.schema";
import {DaysOfWeek, TimeZone} from "../entity/EmailReminder.entity";
import {Constants} from "../helper/Constants.helper";
import {advocateMiddleware} from "../middleware/Advocate.middleware";
import {getClientDetails, getServiceRequestsUser} from "../util/Advocate.util";
import {ClientService} from "../services/Client.service";
import {survivorMiddleware} from "../middleware/Survivor.middleware";
import {AdvocateService} from "../services/Advocate.service";
import {clientSchema} from "../schema/Client.schema";
import {ServiceManagerService} from "../services/ServiceManager.service";
import {addClientService, reportUser} from "../util/Common.util";
import {reportSchema, sendInvitationSchema, serviceSettingsSchema} from "../schema/Organization.schema";
import {clients, getClientsById} from "../util/ServiceRequest.util";


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

@JsonController("/api/organization")
export class AuthController {
    private userService = new UserService();
    private organizationService = new OrganizationService();
    private clientService = new ClientService();
    private advocateService = new AdvocateService();

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
                const settings = await this.organizationService.addServiceDetails(req.user.organization_id, req.user.role, req.body, req.user.id)
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
            let customResponse = [];
            const getOrganizationServices = await this.organizationService.getOrganizationsService(req.user.organization_id);
            for (const service of getOrganizationServices) {
                const data = await getOrganizationsServiceDetails(service)
                customResponse.push(data)
            }
            return ResponseFormatter.successResponse(res, "Successful", customResponse);
        } catch (error: any) {
            return ResponseFormatter.errorResponse(res, error.message || 'An error occurred');
        }
    }

    @Get("/services/:serviceId")
    @UseBefore(authMiddleware)
    @UseBefore(organizationMiddleware)
    async getOrganizationsById(@Req() req: Request, @Res() res: Response, @Param("serviceId") serviceId: number) {
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
    async addServiceSettings(@Req() req: Request, @Res() res: Response) {
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
            const customResponse = await getOrganizationsDetails(organization);
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
        } catch (error: any) {
            return ResponseFormatter.errorResponse(res, error.message || 'An error occurred');
        }
    }

    @Get("/service-requests")
    @UseBefore(authMiddleware)
    @UseBefore(organizationMiddleware)
    async getServiceRequest(@Req() req: Request, @Res() res: Response) {
        try {
            const page_number = parseInt(req.query.page_number as string) || Constants.PAGE_NUMBER;
            const page_size = parseInt(req.query.page_size as string) || Constants.PAGE_SIZE;
            const status = parseInt(req.query.status as string);
            const getServiceRequestsData = await getServiceRequests(req.user.organization_id, page_number, page_size, status);
            return ResponseFormatter.successResponse(res, "Successful", getServiceRequestsData);
        } catch (error: any) {
            return ResponseFormatter.errorResponse(res, error.message || 'An error occurred');
        }
    }

    @Get("/service-requests/:serviceRequestsId")
    @UseBefore(authMiddleware)
    @UseBefore(organizationMiddleware)
    async getServiceRequestsId(@Req() req: Request, @Res() res: Response, @Param("serviceRequestsId") serviceRequestsId: number) {
        try {
            const customResponse = await getServiceRequestDetails(serviceRequestsId)
            return ResponseFormatter.successResponse(res, "Successful", customResponse);
        } catch (error: any) {
            return ResponseFormatter.errorResponse(res, error.message || 'An error occurred');
        }
    }

    @Post("/report-user")
    @UseBefore(authMiddleware)
    @UseBefore(organizationMiddleware)
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

    @Patch("/service-requests/:serviceRequestsId/:status")
    @UseBefore(authMiddleware)
    @UseBefore(organizationMiddleware)
    async changeServiceRequestStatus(@Req() req: Request, @Res() res: Response, @Param("serviceRequestsId") serviceRequestsId: number, @Param("status") status: number) {
        try {
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

    @Post("/clients")
    @UseBefore(authMiddleware)
    @UseBefore(organizationMiddleware)
    async addClient(@Req() req: Request, @Res() res: Response) {
        try {
            if (!req.body) {
                return ResponseFormatter.errorResponse(res, 'Request body is undefined.');
            }
            const {error} = clientSchema.validate(req.body);
            if (error) {
                return ResponseFormatter.errorResponse(res, error.details[0].message);
            }
            const addEditClient = await clients(req.body, req.user.id, req.user.organization_id);
            return ResponseFormatter.successResponse(res, `${addEditClient}`);

        } catch (error: any) {
            return ResponseFormatter.errorResponse(res, error.message || 'An error occurred');
        }
    }

    @Get("/clients")
    @UseBefore(authMiddleware)
    @UseBefore(organizationMiddleware)
    async getClients(@Req() req: Request, @Res() res: Response) {
        try {
            const getClients = await this.advocateService.getClients(req.user.id);
            const customResponse = await getClientDetails(getClients, Constants.ROLE_ADVOCATE)
            return ResponseFormatter.successResponse(res, "Successful", customResponse);
        } catch (error: any) {
            return ResponseFormatter.errorResponse(res, error.message || 'An error occurred');
        }
    }

    @Get("/clients/:clientId")
    @UseBefore(authMiddleware)
    @UseBefore(organizationMiddleware)
    async getClientsById(@Req() req: Request, @Res() res: Response, @Param("clientId") clientId: number) {
        try {
            const customResponse = await getClientsById(clientId, req.user.id);
            return ResponseFormatter.successResponse(res, "Successful", customResponse);
        } catch (error: any) {
            return ResponseFormatter.errorResponse(res, error.message || 'An error occurred');
        }
    }

    @Post("/service-request/add")
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

}
