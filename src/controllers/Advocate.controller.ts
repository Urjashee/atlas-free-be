import {JsonController, Post, Req, Res, UseBefore} from "routing-controllers";
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
}
