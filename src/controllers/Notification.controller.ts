import {Get, JsonController, Req, Res, UseBefore} from "routing-controllers";
import {ClientService} from "../services/Client.service";
import {NotificationService} from "../services/Notification.service";
import {authMiddleware} from "../middleware/Auth.middleware";
import {organizationMiddleware} from "../middleware/Organization.middleware";
import {Request, Response} from "express";
import {getOrganizationsServiceDetails} from "../util/Organization.util";
import {Constants} from "../helper/Constants.helper";
import {ResponseFormatter} from "../helper/ResponseFormatter.helper";

@JsonController("/api/notifications")
export class NotificationController {
    private notificationService = new NotificationService();
    @Get("")
    @UseBefore(authMiddleware)
    async getOrganizations(@Req() req: Request, @Res() res: Response) {
        try {
            let customResponse = [];
            const getNotifications = await this.notificationService.get(req.user.id);
            for (const notification of getNotifications) {
                const data = {
                    "id": notification.id,
                    "email_subject": notification.emailSubject,
                    "email_body": notification.emailBody,
                    "notification_type": notification.notificationType,
                    "created_at": notification.createdAt
                }
                customResponse.push(data)
            }
            return ResponseFormatter.successResponse(res, "Successful", customResponse);
        } catch (error: any) {
            return ResponseFormatter.errorResponse(res, error.message || 'An error occurred');
        }
    }
}