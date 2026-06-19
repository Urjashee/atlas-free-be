import AppDataSource from "../../ormconfig";
import {Notifications} from "../entity/Notification.entity";

export class NotificationService {
    private notificationRepository = AppDataSource.getRepository(Notifications);

    async add(email_subject: string, email_body: string, notification_type: number, user_id: number) {
        const createNotification = await this.notificationRepository.create({
            emailSubject: email_subject,
            emailBody: email_body,
            notificationType: notification_type,
            user: {id: user_id}
        })

        return this.notificationRepository.save(createNotification);
    }

    async get(user_id: number) {
        return await this.notificationRepository.find({
            where: {
                user: {id: user_id}
            }
        })

        // return notification;
    }
}