import {Delete, Get, JsonController, Param, Post, Put, Req, Res, UseBefore} from "routing-controllers";
import {UserService} from "../services/User.service";
import {OrganizationService} from "../services/Organization.service";
import {ConfigService} from "../services/Config.service";
import {ServiceManagerService} from "../services/ServiceManager.service";
import {AdvocateService} from "../services/Advocate.service";
import {ClientService} from "../services/Client.service";
import {authMiddleware} from "../middleware/Auth.middleware";
import {Request, Response} from "express";
import {ResponseFormatter} from "../helper/ResponseFormatter.helper";
import {survivorSchema} from "../schema/Client.schema";
import {survivorMiddleware} from "../middleware/Survivor.middleware";
import {getClientDetails, getServiceRequestsUser} from "../util/Advocate.util";
import {Constants} from "../helper/Constants.helper";
import {getOrganizationsDetails, getOrganizationsServiceDetails} from "../util/Organization.util";
import Joi from "joi";
import {ClientStatus} from "../entity/AssignedServices.entity";

const serviceSchema = Joi.object({
    organization_id: Joi.number().required(),
    client_service_id: Joi.number().required(),
    service_id: Joi.number().required(),
});
const reportServiceSchema = Joi.object({
    service_request_id: Joi.number().required(),
    reason: Joi.string().required(),
});
const profileSchema = Joi.object({
    username: Joi.string().required(),
    email: Joi.string().pattern(/^\S+$/).required(),
    safe_exit: Joi.string().required(),
});
@JsonController("/api/survivor")
export class AdvocateController {
    private userService = new UserService();
    private organizationService = new OrganizationService();
    private configService = new ConfigService();
    private serviceManagerService = new ServiceManagerService();
    private advocateService = new AdvocateService();
    private clientService = new ClientService();

    @Post("/form-details")
    @UseBefore(authMiddleware)
    @UseBefore(survivorMiddleware)
    async addOrganization(@Req() req: Request, @Res() res: Response) {
        try {
            if (!req.body) {
                return ResponseFormatter.errorResponse(res, 'Request body is undefined.');
            }
            const {error} = survivorSchema.validate(req.body);
            if (error) {
                return ResponseFormatter.errorResponse(res, error.details[0].message);
            }
            if (req.body.id) {
                const checkIfValidOrganization = await this.clientService.checkIfValidClient(req.body.id, req.user.id);
                if (!checkIfValidOrganization)
                    return ResponseFormatter.errorResponse(res, 'Invalid client');
                const editClientDetails = await this.clientService.editClient(req.body.id, req.user.id, req.user.organization_id, req.body)
                if (!editClientDetails)
                    return ResponseFormatter.errorResponse(res, "Can't edit, try again later");
                return ResponseFormatter.successResponse(res, "Successfully updated service.");
            } else {
                const addClientDetails = await this.clientService.addClient(req.user.id, req.user.organization_id, req.body)
                if (!addClientDetails)
                    return ResponseFormatter.errorResponse(res, "Can't add, try again later");
                return ResponseFormatter.successResponse(res, "Successfully added service.");
            }

        } catch (error: any) {
            return ResponseFormatter.errorResponse(res, error.message || 'An error occurred');
        }
    }

    @Get("/form-details")
    @UseBefore(authMiddleware)
    @UseBefore(survivorMiddleware)
    async getClientsById(@Req() req: Request, @Res() res: Response) {
        try {
            const getClients = await this.clientService.getClientsById(req.user.id);
            const customResponse = await getClientDetails(getClients, Constants.ROLE_SURVIVOR)
            return ResponseFormatter.successResponse(res, "Successful", customResponse);
        } catch (error: any) {
            return ResponseFormatter.errorResponse(res, error.message || 'An error occurred');
        }
    }

    @Get("/service-details/:serviceId")
    @UseBefore(authMiddleware)
    @UseBefore(survivorMiddleware)
    async getServiceDetails(@Req() req: Request, @Res() res: Response, @Param("serviceId") serviceId: number) {
        try {
            const getServices = await this.organizationService.getOrganizationsServiceById(serviceId)
            if (!getServices)
                return ResponseFormatter.errorResponse(res, 'Invalid service');
            const customResponseService = await getOrganizationsServiceDetails(getServices)
            const organization = await this.organizationService.getOrganizationsById(getServices.organization.id);
            const customResponseOrganization = await getOrganizationsDetails(organization);

            const customResponse = {
                organization: customResponseOrganization,
                service: customResponseService,
            }

            return ResponseFormatter.successResponse(res, "Successful", customResponse);
        } catch (error: any) {
            return ResponseFormatter.errorResponse(res, error.message || 'An error occurred');
        }
    }

    @Post("/service-request/add")
    @UseBefore(authMiddleware)
    @UseBefore(survivorMiddleware)
    async addClientService(@Req() req: Request, @Res() res: Response) {
        try {
            if (!req.body) {
                return ResponseFormatter.errorResponse(res, 'Request body is undefined.');
            }
            const {error} = serviceSchema.validate(req.body);
            if (error) {
                return ResponseFormatter.errorResponse(res, error.details[0].message);
            }
            console.log("Client: ", req.user.id);
            const checkIfOrganization = await this.organizationService.checkIfOrganization(req.body.organization_id);
            if (!checkIfOrganization)
                return ResponseFormatter.errorResponse(res, 'Invalid organization');
            const checkIfClientService = await this.clientService.checkIfClientService(req.body.client_service_id, req.user.id)
            if (!checkIfClientService)
                return ResponseFormatter.errorResponse(res, 'Invalid client service');
            const checkIfService = await this.serviceManagerService.checkIfService(req.body.service_id);
            if (!checkIfService)
                return ResponseFormatter.errorResponse(res, 'Invalid service');
            const checkIfSlotAvailable = await this.organizationService.checkIfSlotAvailable(req.body.service_id, req.body.organization_id);
            if (!checkIfSlotAvailable)
                return ResponseFormatter.errorResponse(res, 'No slot available for this service');
            const addService = await this.clientService.addService(req.body, req.user.id);
            if (!addService)
                return ResponseFormatter.errorResponse(res, "Request can't be sent");
            return ResponseFormatter.successResponse(res, "Successful");
        } catch (error: any) {
            return ResponseFormatter.errorResponse(res, error.message || 'An error occurred');
        }
    }

    @Get("/service-requests")
    @UseBefore(authMiddleware)
    @UseBefore(survivorMiddleware)
    async getClient(@Req() req: Request, @Res() res: Response) {
        try {
            const page_number = parseInt(req.query.page_number as string) || Constants.PAGE_NUMBER;
            const page_size = parseInt(req.query.page_size as string) || Constants.PAGE_SIZE;
            const status = parseInt(req.query.status as string);

            const { data, total } = await this.clientService.getServiceRequests(req.user.id, page_number, page_size, status);

            const customResponse = [];

            for (const service of data) {
                const serviceOption = await this.configService.getServiceOptionsById(service.service.service_type);

                customResponse.push({
                    id: service.id,
                    service_id: service.service.id,
                    service: service.service.name,
                    service_type: serviceOption.name,
                    client_id: service.client_service.id,
                    address: `${service.service.street || ""} ${service.service.address || ""} ${service.service.city || ""} ${service.service.state?.name || ""} ${service.service.zipcode || ""}`.trim(),
                    service_request: service.status
                });
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
    @UseBefore(survivorMiddleware)
    async getServiceRequestsId(@Req() req: Request, @Res() res: Response, @Param("serviceRequestsId") serviceRequestsId: number) {
        try {
            const checkIfValidServiceRequest = await this.clientService.checkIfValidServiceRequest(serviceRequestsId, req.user.id);
            if (!checkIfValidServiceRequest) {
                return ResponseFormatter.errorResponse(res, 'Invalid service request');
            }
            const getServiceRequests = await this.clientService.getServiceRequestById(serviceRequestsId);
            const getServices = await this.organizationService.getOrganizationsServiceById(getServiceRequests.service.id)
            const customServiceRequests = await getServiceRequestsUser(getServiceRequests)
            const customResponseService = await getOrganizationsServiceDetails(getServices)

            const customResponse = {
                client: customServiceRequests,
                service: customResponseService,
            }

            return ResponseFormatter.successResponse(res, "Successful", customResponse);
        } catch (error: any) {
            return ResponseFormatter.errorResponse(res, error.message || 'An error occurred');
        }
    }

    @Delete("/service-requests/:serviceRequestsId")
    @UseBefore(authMiddleware)
    @UseBefore(survivorMiddleware)
    async cancelServiceRequests(@Req() req: Request, @Res() res: Response, @Param("serviceRequestsId") serviceRequestsId: number) {
        try {
            const getServiceRequests = await this.clientService.getServiceRequestById(serviceRequestsId);
            if (!getServiceRequests)
                return ResponseFormatter.errorResponse(res, 'Invalid service request');
            if (getServiceRequests.user.id !== req.user.id)
                return ResponseFormatter.errorResponse(res, 'You are not authorized to report this service request');
            const deleteServiceRequest = await this.clientService.updateServiceRequestStatus(serviceRequestsId, ClientStatus.Cancelled);
            if (!deleteServiceRequest)
                return ResponseFormatter.errorResponse(res, "Can't remove, try again later");
            return ResponseFormatter.successResponse(res, "Successful removed service request");
        } catch (error: any) {
            return ResponseFormatter.errorResponse(res, error.message || 'An error occurred');
        }
    }

    @Post("/service-report")
    @UseBefore(authMiddleware)
    @UseBefore(survivorMiddleware)
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
            const reportService = await this.clientService.reportService(serviceRequestsId, reason, getServiceRequests);
            if (!reportService)
                return ResponseFormatter.errorResponse(res, "Can't report, try again later");

            return ResponseFormatter.successResponse(res, "Successful reported service");
        } catch (error: any) {
            return ResponseFormatter.errorResponse(res, error.message || 'An error occurred');
        }
    }

    @Put("/profile")
    @UseBefore(authMiddleware)
    @UseBefore(survivorMiddleware)
    async editProfile(@Req() req: Request, @Res() res: Response) {
        try {
            if (!req.body) {
                return ResponseFormatter.errorResponse(res, 'Request body is undefined.');
            }
            const {error} = profileSchema.validate(req.body);
            if (error) {
                return ResponseFormatter.errorResponse(res, error.details[0].message);
            }
            const {username, email, safe_exit} = req.body;
            const checkIfSurvivor = await this.clientService.checkIfSurvivor(req.user.id)
            if (!checkIfSurvivor) {
                return ResponseFormatter.errorResponse(res, 'You are not a survivor user');
            }

            const updateProfile = await this.userService.updateUserProfile(req.user.id, username, email, safe_exit);
            if (!updateProfile) {
                return ResponseFormatter.errorResponse(res, "Can't update profile, try again later");
            }
            return ResponseFormatter.successResponse(res, "Profile updated successfully");
        } catch (error: any) {
            return ResponseFormatter.errorResponse(res, error.message || 'An error occurred');
        }
    }

    @Get("/profile")
    @UseBefore(authMiddleware)
    @UseBefore(survivorMiddleware)
    async getProfile(@Req() req: Request, @Res() res: Response) {
        try {
            const checkIfSurvivor = await this.clientService.checkIfSurvivor(req.user.id)
            if (!checkIfSurvivor) {
                return ResponseFormatter.errorResponse(res, 'You are not a survivor user');
            }
            const customResponse = {
                id: req.user.id,
                username: checkIfSurvivor.user_name,
                email: checkIfSurvivor.email,
                safe_exit: checkIfSurvivor.safe_exit,

            }
            return ResponseFormatter.successResponse(res, "Profile updated successfully", customResponse);
        } catch (error: any) {
            return ResponseFormatter.errorResponse(res, error.message || 'An error occurred');
        }
    }
}
