import {Delete, Get, JsonController, Param, Patch, Post, Req, Res, UseBefore} from "routing-controllers";
import {authMiddleware} from "../middleware/Auth.middleware";
import {organizationMiddleware} from "../middleware/Organization.middleware";
import {Request, Response} from "express";
import {ResponseFormatter} from "../helper/ResponseFormatter.helper";
import {UserService} from "../services/User.service";
import {OrganizationService} from "../services/Organization.service";
import {ConfigService} from "../services/Config.service";
import {serviceManagerMiddleware} from "../middleware/ServiceManager.middleware";
import {ServiceManagerService} from "../services/ServiceManager.service";
import {clientServiceSchema, servicesSchema} from "../schema/Services.schema";
import {getOrganizationsServiceDetails} from "../util/Organization.util";
import Joi from "joi";
import {Constants} from "../helper/Constants.helper";
import {getClientDetails} from "../util/Advocate.util";
import {ClientService} from "../services/Client.service";
import {AdvocateService} from "../services/Advocate.service";
import {emailReminderSchema, reportSchema} from "../schema/Organization.schema";
import {clientSchema} from "../schema/Client.schema";
import {clients, getClientsById} from "../util/ServiceRequest.util";
import {addClientService, reportUser} from "../util/Common.util";
import {advocateMiddleware} from "../middleware/Advocate.middleware";
import {DaysOfWeek, TimeZone} from "../entity/EmailReminder.entity";

const serviceSettingsSchema = Joi.object({
    organization_id: Joi.number(),
    service_id: Joi.number().required(),
    available_slots: Joi.number().required(),
    contact_email: Joi.string().required(),
    contact_phone: Joi.number().required(),
    emailReminders: Joi.array().items(emailReminderSchema).min(1).required()
})

const reportServiceSchema = Joi.object({
    service_request_id: Joi.number().required(),
    reason: Joi.string().required(),
});

@JsonController("/api/service-manager")
export class ServiceManagerController {
    private userService = new UserService();
    private organizationService = new OrganizationService();
    private configService = new ConfigService();
    private serviceManagerService = new ServiceManagerService();
    private clientService = new ClientService();
    private advocateService = new AdvocateService();

    @Post("/services")
    @UseBefore(authMiddleware)
    @UseBefore(serviceManagerMiddleware)
    async addOrganization(@Req() req: Request, @Res() res: Response) {
        try {
            if (!req.body) {
                return ResponseFormatter.errorResponse(res, 'Request body is undefined.');
            }
            const {error} = servicesSchema.validate(req.body);
            if (error) {
                return ResponseFormatter.errorResponse(res, error.details[0].message);
            }
            if (!req.body.id)
                return ResponseFormatter.errorResponse(res, 'Service ID is required.');

            const checkIfValidService = await this.serviceManagerService.checkIfValidService(req.body.id, req.user.organization_id, req.user.id);
            if (!checkIfValidService)
                return ResponseFormatter.errorResponse(res, 'Invalid service');
            const settings = await this.organizationService.editServiceDetails(req.body.id, req.user.organization_id, req.user.role, req.body, req.user.id)
            if (!settings)
                return ResponseFormatter.errorResponse(res, "Can't edit, try again later");
            return ResponseFormatter.successResponse(res, "Successfully updated service settings.");
        } catch (error: any) {
            return ResponseFormatter.errorResponse(res, error.message || 'An error occurred');
        }
    }

    @Get("/services")
    @UseBefore(authMiddleware)
    @UseBefore(serviceManagerMiddleware)
    async getOrganizations(@Req() req: Request, @Res() res: Response) {
        try {
            let customResponse = [];
            const getOrganizationServices = await this.serviceManagerService.getServiceManagerService(req.user.id);
            for (const service of getOrganizationServices) {
                const data = await getOrganizationsServiceDetails(service, Constants.ROLE_SERVICE_MANAGER)
                customResponse.push(data)
            }
            return ResponseFormatter.successResponse(res, "Successful", customResponse);
        } catch (error: any) {
            return ResponseFormatter.errorResponse(res, error.message || 'An error occurred');
        }
    }

    @Get("/services/:serviceId")
    @UseBefore(authMiddleware)
    @UseBefore(serviceManagerMiddleware)
    async getOrganizationsById(@Req() req: Request, @Res() res: Response, @Param("serviceId") serviceId: number) {
        try {
            const checkIfValidService = await this.serviceManagerService.checkIfValidService(serviceId, req.user.organization_id, req.user.id);
            if (!checkIfValidService)
                return ResponseFormatter.errorResponse(res, 'Invalid service');
            const getOrganizationServices = await this.serviceManagerService.getServiceManagerServiceById(serviceId, req.user.id);
            const customResponse = await getOrganizationsServiceDetails(getOrganizationServices)
            return ResponseFormatter.successResponse(res, "Successful", customResponse);
        } catch (error: any) {
            return ResponseFormatter.errorResponse(res, error.message || 'An error occurred');
        }
    }

    @Post("/services-settings")
    @UseBefore(authMiddleware)
    @UseBefore(serviceManagerMiddleware)
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
            const checkIfValidServiceManager = await this.serviceManagerService.checkIfValidService(req.body.service_id, req.user.organization_id, req.user.id)
            if (!checkIfValidServiceManager)
                return ResponseFormatter.errorResponse(res, "Not a valid service manager");
            const checkIfServiceSettings = await this.organizationService.checkIfServiceExists(req.body.service_id);
            if (checkIfServiceSettings) {
                const editServiceSettings = await this.serviceManagerService.editServiceSettings(req.body);
                if (!editServiceSettings)
                    return ResponseFormatter.errorResponse(res, "Can't edit, try again later");
                return ResponseFormatter.successResponse(res, "Successfully updated service settings.");
            }
        } catch (error: any) {
            return ResponseFormatter.errorResponse(res, error.message || 'An error occurred');
        }
    }

    @Get("/services-settings/:serviceId")
    @UseBefore(authMiddleware)
    @UseBefore(serviceManagerMiddleware)
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
                service_id: getServiceSettings.id,
                total_available_slots: checkIfValidService.total_available_slots || "",
                available_slots: getServiceSettings.slots_available || "",
                service_manager: await this.organizationService.getServiceManager(getServiceSettings.service_manager) || [],
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

    @Get("/service-requests")
    @UseBefore(authMiddleware)
    @UseBefore(serviceManagerMiddleware)
    async getServiceRequest(@Req() req: Request, @Res() res: Response) {
        try {
            const page_number = parseInt(req.query.page_number as string) || Constants.PAGE_NUMBER;
            const page_size = parseInt(req.query.page_size as string) || Constants.PAGE_SIZE;
            const status = parseInt(req.query.status as string);

            const {
                data,
                total
            } = await this.serviceManagerService.getServiceRequests(req.user.id, page_number, page_size, status);

            const customResponse = [];

            for (const service of data) {

                const user = await this.userService.findById(service.user.id);
                if (user.role.id != Constants.ROLE_SURVIVOR) {
                    customResponse.push({
                        type: "user",
                        id: service.id,
                        service_id: service.service.id,
                        service: service.service.name,
                        case_no: service.case_no,
                        requested_by: `${user.first_name} ${user.last_name}`,
                        date_time: service.created_at,
                        service_request: service.status,
                        client_service_id: service.client_service.id,
                        user: service.user.id
                    });
                }

                if (user.role.id == Constants.ROLE_SURVIVOR) {
                    customResponse.push({
                        type: "survivor",
                        id: service.id,
                        service_id: service.service.id,
                        service: service.service.name,
                        client_name: `${user.user_name}`,
                        client_email: user.email,
                        date_time: service.created_at,
                        service_request: service.status,
                        client_service_id: service.client_service.id,
                        user: service.user.id
                    });
                }
            }

            return ResponseFormatter.successResponse(res, "Successful", {
                current_page: page_number,
                page_size,
                total_items: total,
                total_pages: Math.ceil(total / page_size),
                data: customResponse
            });
        } catch (error: any) {
            return ResponseFormatter.errorResponse(res, error.message || 'An error occurred');
        }
    }

    @Get("/service-requests/:serviceRequestsId")
    @UseBefore(authMiddleware)
    @UseBefore(serviceManagerMiddleware)
    async getServiceRequestsId(@Req() req: Request, @Res() res: Response, @Param("serviceRequestsId") serviceRequestsId: number) {
        try {
            const getServiceRequest = await this.clientService.getServiceRequestById(serviceRequestsId);
            if (!getServiceRequest) {
                return ResponseFormatter.errorResponse(res, "Service request not found");
            }
            let client, form
            const user = await this.userService.findById(getServiceRequest.user.id);
            const getClients = await this.advocateService.getClientsById(getServiceRequest.id);
            if (user.role.id != Constants.ROLE_SURVIVOR) {
                client = {
                    type: "user",
                    id: getServiceRequest.id,
                    service_id: getServiceRequest.service.id,
                    service: getServiceRequest.service.name,
                    case_no: getServiceRequest.case_no,
                    requested_by: `${user.first_name} ${user.last_name}`,
                    date_time: getServiceRequest.created_at,
                    service_request: getServiceRequest.status,
                    client_service_id: getServiceRequest.client_service.id,
                    user: getServiceRequest.user.id
                };
                form = await getClientDetails(getClients, Constants.ROLE_ADVOCATE)
            }
            if (user.role.id == Constants.ROLE_SURVIVOR) {
                client = {
                    type: "survivor",
                    id: getServiceRequest.id,
                    service_id: getServiceRequest.service.id,
                    service: getServiceRequest.service.name,
                    client_name: `${user.user_name}`,
                    client_email: user.email,
                    date_time: getServiceRequest.created_at,
                    service_request: getServiceRequest.status,
                    client_service_id: getServiceRequest.client_service.id,
                    user: getServiceRequest.user.id
                };
                form = await getClientDetails(getClients, Constants.ROLE_SURVIVOR)
            }

            const customResponse = {
                client: client,
                form: form,
            }

            return ResponseFormatter.successResponse(res, "Successful", customResponse);
        } catch (error: any) {
            return ResponseFormatter.errorResponse(res, error.message || 'An error occurred');
        }
    }

    @Post("/service-report")
    @UseBefore(authMiddleware)
    @UseBefore(advocateMiddleware)
    async reportService(@Req() req: Request, @Res() res: Response) {
        try {
            if (!req.body) {
                return ResponseFormatter.errorResponse(res, 'Request body is undefined.');
            }
            const {error} = reportServiceSchema.validate(req.body);
            if (error) {
                return ResponseFormatter.errorResponse(res, error.details[0].message);
            }

            const {serviceRequestsId, reason} = req.body;

            const getServiceRequests = await this.clientService.getServiceRequestById(serviceRequestsId);
            if (!getServiceRequests)
                return ResponseFormatter.errorResponse(res, 'Invalid service request');
            if (getServiceRequests.user.id !== req.user.id)
                return ResponseFormatter.errorResponse(res, 'You are not authorized to report this service request');
            const checkIfService = await this.serviceManagerService.checkIfService(getServiceRequests.service.id);
            if (!checkIfService)
                return ResponseFormatter.errorResponse(res, 'Invalid service');
            const reportService = await this.clientService.reportService(serviceRequestsId, reason, getServiceRequests, req.user.email);
            if (!reportService)
                return ResponseFormatter.errorResponse(res, "Can't report, try again later");

            return ResponseFormatter.successResponse(res, "Successful reported service");
        } catch (error: any) {
            return ResponseFormatter.errorResponse(res, error.message || 'An error occurred');
        }
    }

    @Post("/report-user")
    @UseBefore(authMiddleware)
    @UseBefore(serviceManagerMiddleware)
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
    @UseBefore(serviceManagerMiddleware)
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
    @UseBefore(serviceManagerMiddleware)
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
    @UseBefore(serviceManagerMiddleware)
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
    @UseBefore(serviceManagerMiddleware)
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
    @UseBefore(serviceManagerMiddleware)
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

    @Delete("/service-delete/:serviceId")
    @UseBefore(authMiddleware)
    @UseBefore(serviceManagerMiddleware)
    async serviceDelete(@Req() req: Request, @Res() res: Response, @Param("serviceId") serviceId: number) {
        try {
            const checkValidService = await this.organizationService.checkIfValidOrganization(serviceId, req.user.organization_id);
            if (!checkValidService)
                return ResponseFormatter.errorResponse(res, "Not a valid service")
            const checkIfValidServiceManager = await this.serviceManagerService.checkIfValidService(serviceId, req.user.organization_id, req.user.id)

            if (!checkIfValidServiceManager)
                return ResponseFormatter.errorResponse(res, "Not a valid service manager");

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

}
