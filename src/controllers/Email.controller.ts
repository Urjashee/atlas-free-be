import {CreatePassword, RejectOrganization} from "../helper/Emails.helper";
import {Constants} from "../helper/Constants.helper";


import {Get, JsonController, Param, Req, Res, UseBefore} from "routing-controllers";
import {EmailService} from "../services/Email.service";
import {authMiddleware} from "../middleware/Auth.middleware";
import {adminMiddleware} from "../middleware/Admin.middleware";
import {Request, Response} from "express";
import {UserService} from "../services/User.service";
import {OrganizationService} from "../services/Organization.service";
import AppDataSource from "../../ormconfig";
import {Users} from "../entity/Users.entity";
import {randomBytes} from "crypto";
import {ResponseFormatter} from "../helper/ResponseFormatter.helper";

@JsonController("/api/email")

export class EmailController {
    private userService = new UserService();
    private organizationService = new OrganizationService();
    private mailerService = new EmailService();
    private userRepository = AppDataSource.getRepository(Users);

    @Get("/organization-rejected")
    @UseBefore(authMiddleware)
    @UseBefore(adminMiddleware)
    async getOrganizationList(@Req() req: Request, @Res() res: Response) {
       try {
            const token = randomBytes(32).toString('hex');
            const organization = await this.userRepository.findOne({
                where: {
                    organization: {id: 5},
                    role: {id: Constants.ROLE_ORGANIZATION_ADMIN}
                },
                relations: ['organization']
            })
            const emailContent = RejectOrganization(organization.user_name, organization.organization.name, organization.email, token, Constants.CREATE_PASSWORD, organization.role.id);
            const mailOptions = {
                from: `"${process.env.MAIL_FROM_NAME}" <${process.env.MAIL_FROM_ADDRESS}>`,
                to: "urja@simpalm.com",
                subject: `${organization.organization.name} could not be verified in Wayplace`,
                html: emailContent
            };
            await this.mailerService.sendEmail(mailOptions);
           return ResponseFormatter.successResponse(res, "Email sent successfully.");
        }
       catch (error: any) {
           return ResponseFormatter.errorResponse(res, error.message || 'An error occurred');
       }
    }
}
