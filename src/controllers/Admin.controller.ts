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
import {getOrganizationsDetails, getOrganizationsServiceDetails, getUserDetails} from "../util/Organization.util";
import {getRoleIdByName} from "../util/Common.util";
import {organizationMiddleware} from "../middleware/Organization.middleware";
import {sendInvitationSchema} from "../schema/Organization.schema";
import {Constants} from "../helper/Constants.helper";
import {removeUser} from "../schema/Admin.schema";

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
            const {organization_id, user_id, service_id, email} = req.body
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
            const checkIfEmail = await this.organizationService.checkIfEmailIsServiceManager(email, user_id, organization_id);
            if (!checkIfEmail) {
                return ResponseFormatter.errorResponse(res, 'Email provided is not a service manager');
            }
            const removeUserService = await this.organizationService.removeUserFromService(user_id, service_id, checkIfEmail.id);
            if (!removeUserService) {
                return ResponseFormatter.errorResponse(res, 'Failed to remove user from service');
            }
            return ResponseFormatter.successResponse(res, 'Service Removed from user successfully');
        } catch (error: any) {
            return ResponseFormatter.errorResponse(res, error.message || 'An error occurred');
        }
    }
}
