import {Get, JsonController, Param, Patch, Post, Req, Res, UseBefore} from "routing-controllers";
import {authMiddleware} from "../middleware/Auth.middleware";
import {organizationMiddleware} from "../middleware/Organization.middleware";
import {Request, Response} from "express";
import {ResponseFormatter} from "../helper/ResponseFormatter.helper";
import {UserService} from "../services/User.service";
import {OrganizationService} from "../services/Organization.service";
import {ConfigService} from "../services/Config.service";
import {serviceManagerMiddleware} from "../middleware/ServiceManager.middleware";
import {ServiceManagerService} from "../services/ServiceManager.service";
import {servicesSchema} from "../schema/Services.schema";
import {getOrganizationsServiceDetails} from "../util/Organization.util";
import Joi from "joi";
import {Constants} from "../helper/Constants.helper";
import {getClientDetails} from "../util/Advocate.util";
import {ClientService} from "../services/Client.service";
import {AdvocateService} from "../services/Advocate.service";
import {reportSchema} from "../schema/Organization.schema";

const serviceSettingsSchema = Joi.object({
    service_id: Joi.number().required(),
    available_slots: Joi.number().required(),
})



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

            if (req.body.id) {
                const checkIfValidService = await this.serviceManagerService.checkIfValidService(req.body.id, req.user.organization_id, req.user.id);
                if (!checkIfValidService)
                    return ResponseFormatter.errorResponse(res, 'Invalid service');
                const settings = await this.organizationService.editServiceDetails(req.body.id, req.user.organization_id, req.user.role, req.body, req.user.id)
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
    @UseBefore(serviceManagerMiddleware)
    async getOrganizations(@Req() req: Request, @Res() res: Response) {
        try {
            const getOrganizationServices = await this.serviceManagerService.getServiceManagerService(req.user.id);
            const customResponse = await getOrganizationsServiceDetails(getOrganizationServices)
            return ResponseFormatter.successResponse(res, "Successful", customResponse);
        } catch (error: any) {
            return ResponseFormatter.errorResponse(res, error.message || 'An error occurred');
        }
    }

    @Get("/services/:serviceId")
    @UseBefore(authMiddleware)
    @UseBefore(serviceManagerMiddleware)
    async getOrganizationsById(@Req() req: Request, @Res() res: Response, @Param("serviceId") serviceId: number ) {
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
            const checkIfValidServiceManager = await this.serviceManagerService.getServiceManagerServiceById(req.body.service_id, req.user.id)
            if (!checkIfValidServiceManager)
                return ResponseFormatter.errorResponse(res, "Not a valid service manager");
            const checkIfServiceSettings = await this.organizationService.checkIfServiceSettingsExists(req.body.service_id);
            if (checkIfServiceSettings) {
                const editServiceSettings = await this.serviceManagerService.editServiceSettings(req.body);
                if (!editServiceSettings)
                    return ResponseFormatter.errorResponse(res, "Can't edit, try again later");
                return ResponseFormatter.successResponse(res, "Successfully updated service settings.");
            } else {
                const addServiceSettings = await this.serviceManagerService.addServiceSettings(req.body);
                if (!addServiceSettings)
                    return ResponseFormatter.errorResponse(res, "Can't add, try again later");
                return ResponseFormatter.successResponse(res, "Successfully added service settings.");
            }
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
            } = await this.organizationService.getServiceRequests(req.user.organization_id, page_number, page_size, status);

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
            const {type, reported_user, reason} = req.body;
            if (type == 'survivor') {
                const checkIfSurvivorUser = await this.userService.checkIfSurvivor(reported_user);
                if (!checkIfSurvivorUser) {
                    return ResponseFormatter.errorResponse(res, "Not a valid user");
                }
            }
            if (type == 'advocate') {
                const checkIfAdvocateUser = await this.userService.checkIfAdvocate(reported_user);
                if (!checkIfAdvocateUser) {
                    return ResponseFormatter.errorResponse(res, "Not a valid advocate");
                }
            }
            const reportUser = await this.organizationService.reportUser(type, reported_user, reason, req.user.id, req.user.organization_id);
            if (!reportUser)
                return ResponseFormatter.errorResponse(res, "Can't report user, try again later");
            return ResponseFormatter.successResponse(res, 'Users reported');
        } catch (error: any) {
            return ResponseFormatter.errorResponse(res, error.message || 'An error occurred');
        }
    }

    @Patch("/service-request/:serviceRequestsId/:status")
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


}
