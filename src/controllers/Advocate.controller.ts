import {Get, JsonController, Param, Post, Req, Res, UseBefore} from "routing-controllers";
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
import {getClientDetails} from "../util/Advocate.util";
import {organizationMiddleware} from "../middleware/Organization.middleware";

@JsonController("/api/advocate")
export class AdvocateController {
    private userService = new UserService();
    private organizationService = new OrganizationService();
    private configService = new ConfigService();
    private serviceManagerService = new ServiceManagerService();
    private advocateService = new AdvocateService();

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
    async getClientsById(@Req() req: Request, @Res() res: Response, @Param("clientId") clientId: number ) {
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
    async getOrganizationById(@Req() req: Request, @Res() res: Response ) {
        try {
            const checkIfValidOrganization = await this.advocateService.checkIfValidOrganization(req.user.organization_id, req.user.id);
            if (!checkIfValidOrganization)
                return ResponseFormatter.errorResponse(res, 'Invalid organization');
            const organization = await this.organizationService.getOrganizationsById(req.user.organization_id);
            const customResponse =await getOrganizationsDetails(organization);
            return ResponseFormatter.successResponse(res, "Organization", customResponse)
        } catch (error: any) {
            return ResponseFormatter.errorResponse(res, error.message || 'An error occurred');
        }
    }

    @Get("/services/:serviceId")
    @UseBefore(authMiddleware)
    @UseBefore(advocateMiddleware)
    async getOrganizationsById(@Req() req: Request, @Res() res: Response, @Param("serviceId") serviceId: number ) {
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
}
