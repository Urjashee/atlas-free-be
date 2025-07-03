import {Delete, Get, JsonController, Param, Patch, Post, Req, Res, UseBefore} from "routing-controllers";
import {UserService} from "../services/User.service";
import {OrganizationService} from "../services/Organization.service";
import {ConfigService} from "../services/Config.service";
import {ServiceManagerService} from "../services/ServiceManager.service";
import {authMiddleware} from "../middleware/Auth.middleware";
import {Request, Response} from "express";
import {ResponseFormatter} from "../helper/ResponseFormatter.helper";
import {advocateMiddleware} from "../middleware/Advocate.middleware";
import {clientSchema} from "../schema/Client.schema";
import {AdvocateService} from "../services/Advocate.service";
import {getOrganizationsDetails, getOrganizationsServiceDetails} from "../util/Organization.util";
import {getClientDetails, getServiceRequestsUser} from "../util/Advocate.util";
import {organizationMiddleware} from "../middleware/Organization.middleware";
import {Constants} from "../helper/Constants.helper";
import Joi from "joi";
import {ClientService} from "../services/Client.service";

const serviceSchema = Joi.object({
    organization_id: Joi.number().required(),
    advocate_id: Joi.number().required(),
    client_id: Joi.number().required(),
    service_id: Joi.number().required(),
});
const reportServiceSchema = Joi.object({
    service_request_id: Joi.number().required(),
    reason: Joi.string().required(),
});

@JsonController("/api/advocate")
export class AdvocateController {
    private userService = new UserService();
    private organizationService = new OrganizationService();
    private configService = new ConfigService();
    private serviceManagerService = new ServiceManagerService();
    private advocateService = new AdvocateService();
    private clientService = new ClientService();

    @Post("/clients")
    @UseBefore(authMiddleware)
    @UseBefore(advocateMiddleware)
    async addOrganization(@Req() req: Request, @Res() res: Response) {
        try {
            if (!req.body) {
                return ResponseFormatter.errorResponse(res, 'Request body is undefined.');
            }
            const {error} = clientSchema.validate(req.body);
            if (error) {
                return ResponseFormatter.errorResponse(res, error.details[0].message);
            }
            if (req.body.id) {
                const checkIfValidOrganization = await this.advocateService.checkIfValidClient(req.body.id, req.user.id);
                if (!checkIfValidOrganization)
                    return ResponseFormatter.errorResponse(res, 'Invalid client');
                const editClientDetails = await this.advocateService.editClient(req.body.id, req.user.id, req.user.organization_id, req.body)
                if (!editClientDetails)
                    return ResponseFormatter.errorResponse(res, "Can't edit, try again later");
                return ResponseFormatter.successResponse(res, "Successfully updated clients.");
            } else {
                const addClientDetails = await this.advocateService.addClient(req.user.id, req.user.organization_id, req.body)
                if (!addClientDetails)
                    return ResponseFormatter.errorResponse(res, "Can't add, try again later");
                return ResponseFormatter.successResponse(res, "Successfully added clients.");
            }

        } catch (error: any) {
            return ResponseFormatter.errorResponse(res, error.message || 'An error occurred');
        }
    }

    @Get("/clients")
    @UseBefore(authMiddleware)
    @UseBefore(advocateMiddleware)
    async getClients(@Req() req: Request, @Res() res: Response) {
        try {
            const getClients = await this.advocateService.getClients(req.user.id);
            const customResponse = await getClientDetails(getClients)
            return ResponseFormatter.successResponse(res, "Successful", customResponse);
        } catch (error: any) {
            return ResponseFormatter.errorResponse(res, error.message || 'An error occurred');
        }
    }

    @Get("/clients/:clientId")
    @UseBefore(authMiddleware)
    @UseBefore(advocateMiddleware)
    async getClientsById(@Req() req: Request, @Res() res: Response, @Param("clientId") clientId: number) {
        try {
            const checkIfValidOrganization = await this.advocateService.checkIfValidClient(clientId, req.user.id);
            if (!checkIfValidOrganization)
                return ResponseFormatter.errorResponse(res, 'Invalid client');
            const getClients = await this.advocateService.getClientsById(clientId);
            const customResponse = await getClientDetails(getClients)
            return ResponseFormatter.successResponse(res, "Successful", customResponse);
        } catch (error: any) {
            return ResponseFormatter.errorResponse(res, error.message || 'An error occurred');
        }
    }

    @Get("/organization/details")
    @UseBefore(authMiddleware)
    @UseBefore(advocateMiddleware)
    async getOrganizationById(@Req() req: Request, @Res() res: Response) {
        try {
            const checkIfValidOrganization = await this.advocateService.checkIfValidOrganization(req.user.organization_id, req.user.id);
            if (!checkIfValidOrganization)
                return ResponseFormatter.errorResponse(res, 'Invalid organization');
            const organization = await this.organizationService.getOrganizationsById(req.user.organization_id);
            const customResponse = await getOrganizationsDetails(organization);
            return ResponseFormatter.successResponse(res, "Organization", customResponse)
        } catch (error: any) {
            return ResponseFormatter.errorResponse(res, error.message || 'An error occurred');
        }
    }

    @Get("/services/:serviceId")
    @UseBefore(authMiddleware)
    @UseBefore(advocateMiddleware)
    async getOrganizationsById(@Req() req: Request, @Res() res: Response, @Param("serviceId") serviceId: number) {
        try {
            const checkIfValidOrganization = await this.advocateService.checkIfValidOrganization(req.user.organization_id, req.user.id);
            if (!checkIfValidOrganization)
                return ResponseFormatter.errorResponse(res, 'Invalid organization');
            const getOrganizationServices = await this.organizationService.getOrganizationsServiceById(serviceId);
            const customResponse = await getOrganizationsServiceDetails(getOrganizationServices)
            return ResponseFormatter.successResponse(res, "Successful", customResponse);
        } catch (error: any) {
            return ResponseFormatter.errorResponse(res, error.message || 'An error occurred');
        }
    }

    @Get("/services")
    @UseBefore(authMiddleware)
    @UseBefore(advocateMiddleware)
    async getServiceList(@Req() req: Request, @Res() res: Response) {
        try {
            const page_number = parseInt(req.query.page_number as string) || Constants.PAGE_NUMBER;
            const page_size = parseInt(req.query.page_size as string) || Constants.PAGE_SIZE;
            const service_type = parseInt(req.query.service as string)
            const state = parseInt(req.query.state as string);
            const city = req.query.city as string;
            const zipcode = req.query.zipcode as string
            const availability = req.query.availability as string
            const structure = req.query.structure
            const children = req.query.children as string
            const staffing = parseInt(req.query.staffing as string)
            const substance = req.query.substance
            const faith = req.query.faith
            const living_arrangement = req.query.living_arrangement
            const guidelines = req.query.guidelines
            const staff_diversity = req.query.staff_diversity

            const getOrganizationService = await this.organizationService.getServices(page_number, page_size,
                service_type, state, city, zipcode, availability, structure, staffing, substance, children,
                faith, living_arrangement, guidelines, staff_diversity);
            return ResponseFormatter.successResponse(res, "Successful", getOrganizationService);
        } catch (error: any) {
            return ResponseFormatter.errorResponse(res, error.message || 'An error occurred');
        }
    }

    @Get("/service-details/:serviceId")
    @UseBefore(authMiddleware)
    @UseBefore(advocateMiddleware)
    async getServiceDetails(@Req() req: Request, @Res() res: Response, @Param("serviceId") serviceId: number) {
        try {
            const getServices = await this.organizationService.getOrganizationsServiceById(serviceId)
            const customResponseService = await getOrganizationsServiceDetails(getServices)
            const organization = await this.organizationService.getOrganizationsById(getServices[0].organization.id);
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
    @UseBefore(advocateMiddleware)
    async addClientService(@Req() req: Request, @Res() res: Response) {
        try {
            if (!req.body) {
                return ResponseFormatter.errorResponse(res, 'Request body is undefined.');
            }
            const {error} = serviceSchema.validate(req.body);
            if (error) {
                return ResponseFormatter.errorResponse(res, error.details[0].message);
            }
            const checkIfOrganization = await this.organizationService.checkIfOrganization(req.body.organization_id);
            if (!checkIfOrganization)
                return ResponseFormatter.errorResponse(res, 'Invalid organization');
            const checkIfAdvocate = await this.advocateService.checkIfAdvocate(req.body.advocate_id);
            if (!checkIfAdvocate)
                return ResponseFormatter.errorResponse(res, 'Invalid advocate');
            const checkIfClient = await this.advocateService.checkIfAdvocateClient(req.body.advocate_id, req.body.client_id)
            if (!checkIfClient)
                return ResponseFormatter.errorResponse(res, 'Invalid client');
            const checkIfService = await this.serviceManagerService.checkIfService(req.body.service_id);
            if (!checkIfService)
                return ResponseFormatter.errorResponse(res, 'Invalid service');
            const addService = await this.clientService.addService(req.body);
            if (!addService)
                return ResponseFormatter.errorResponse(res, "Request can't be sent");
            return ResponseFormatter.successResponse(res, "Successful");
        } catch (error: any) {
            return ResponseFormatter.errorResponse(res, error.message || 'An error occurred');
        }
    }

    @Get("/service-requests")
    @UseBefore(authMiddleware)
    @UseBefore(advocateMiddleware)
    async getClient(@Req() req: Request, @Res() res: Response) {
        try {
            const getServices = await this.clientService.getServiceRequests(req.user.id)
            const customResponse = [];

            for (const service of getServices) {
                customResponse.push({
                    id: service.id,
                    client_id: service.client.id,
                    case_no: service.case_no,
                    client_nick_name: service.client.client_nick_name,
                    service_request: service.status
                });
            }
            return ResponseFormatter.successResponse(res, "Successful", customResponse);
        } catch (error: any) {
            return ResponseFormatter.errorResponse(res, error.message || 'An error occurred');
        }
    }

    @Get("/service-requests/:serviceRequestsId")
    @UseBefore(authMiddleware)
    @UseBefore(advocateMiddleware)
    async getServiceRequestsId(@Req() req: Request, @Res() res: Response, @Param("serviceRequestsId") serviceRequestsId: number) {
        try {
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
            if (getServiceRequests.advocate.id !== req.user.id)
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

    @Delete("/service-request/:serviceRequestsId")
    @UseBefore(authMiddleware)
    @UseBefore(advocateMiddleware)
    async deleteServiceRequests(@Req() req: Request, @Res() res: Response, @Param("serviceRequestsId") serviceRequestsId: number) {
        try {
            const getServiceRequests = await this.clientService.getServiceRequestById(serviceRequestsId);
            if (!getServiceRequests)
                return ResponseFormatter.errorResponse(res, 'Invalid service request');
            if (getServiceRequests.advocate.id !== req.user.id)
                return ResponseFormatter.errorResponse(res, 'You are not authorized to report this service request');
            const deleteServiceRequest = await this.clientService.deleteServiceRequest(serviceRequestsId);
            if (!deleteServiceRequest)
                return ResponseFormatter.errorResponse(res, "Can't remove, try again later");
            return ResponseFormatter.successResponse(res, "Successful removed service request");
        } catch (error: any) {
            return ResponseFormatter.errorResponse(res, error.message || 'An error occurred');
        }
    }

}

