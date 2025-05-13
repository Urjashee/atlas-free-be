import {Get, JsonController, Param, Post, Req, Res, UseBefore} from "routing-controllers";
import {authMiddleware} from "../middleware/authMiddleware";
import {organizationMiddleware} from "../middleware/organizationMiddleware";
import {Request, Response} from "express";
import {ResponseFormatter} from "../helper/ResponseFormatter";
import {UserService} from "../services/UserService";
import {OrganizationService} from "../services/OrganizationService";
import {ConfigService} from "../services/ConfigService";
import {serviceManagerMiddleware} from "../middleware/serviceManagerMiddleware";
import {ServiceManagerService} from "../services/ServiceManagerService";
import {servicesSchema} from "../schema/services.schema";
import {getOrganizationsServiceDetails} from "../util/Organization.util";

@JsonController("/api/service-manager")
export class ServiceManagerController {
    private userService = new UserService();
    private organizationService = new OrganizationService();
    private configService = new ConfigService();
    private serviceManagerService = new ServiceManagerService();

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
                return ResponseFormatter.successResponse(res, "Successfully added service settings.");
            } else {
                const settings = await this.organizationService.addServiceDetails(req.user.organization_id, req.user.role, req.body, req.user.id)
                if (!settings)
                    return ResponseFormatter.errorResponse(res, "Can't add, try again later");
                return ResponseFormatter.successResponse(res, "Successfully updated service settings.");
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
}
