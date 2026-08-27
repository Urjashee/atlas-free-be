import AppDataSource from "../../ormconfig";
import {ServiceDetailsOptions} from "../entity/ServiceDetailsOptions.entity";
import {RegistrationOption} from "../entity/RegistrationOption.entity";
import {AdvocateService} from "../entity/AdvocateService.entity";
import {In} from "typeorm";
import {State} from "../entity/State.entity";
import {ServiceSetting} from "../entity/ServiceSetting.entity";
import {ServiceDetails} from "../entity/ServiceDetails.entity";
import {ServiceSettingReminder} from "../helper/Emails.helper";
import {EmailService} from "./Email.service";
import {DaysOfWeek, EmailReminder, TimeZoneUtcOffset} from "../entity/EmailReminder.entity";

export class ConfigService {
    private serviceDetailsRepository = AppDataSource.getRepository(ServiceDetails);
    private serviceDetailOptionRepository = AppDataSource.getRepository(ServiceDetailsOptions);
    private registrationOptionRepository = AppDataSource.getRepository(RegistrationOption);
    private advocateServiceRepository = AppDataSource.getRepository(AdvocateService);
    private stateRepository = AppDataSource.getRepository(State);
    private emailReminderRepository = AppDataSource.getRepository(EmailReminder);
    private mailerService = new EmailService();

    async getState() {
        return await this.stateRepository.find()
    }
    async getPrimaryPurpose() {
        return await this.registrationOptionRepository.find({
            where: {
                type: "primary_purpose"
            }
        })
    }

    async getPlatformPurpose() {
        return await this.registrationOptionRepository.find({
            where: {
                type: "platform_purpose"
            }
        })
    }

    async getAffiliationLicenses() {
        return await this.registrationOptionRepository.find({
            where: {
                type: "affiliations_licenses"
            }
        })
    }

    async getServiceOptions(type: string) {
        return await this.serviceDetailOptionRepository.find({
            where: {
                type: type
            }
        })
    }

    async getServiceOptionsById(id: number) {
        return await this.serviceDetailOptionRepository.findOne({
            where: {
                id: id
            }
        })
    }

    async getAdvocateService() {
        return await this.advocateServiceRepository.find()
    }

    async getAdvocateServiceById(id: number) {
        return await this.advocateServiceRepository.findOne({
            where: {
                id
            }
        })
    }

    async getPrimaryPurposeById(ids: number[]) {
        return await this.registrationOptionRepository.find({
            where: {
                id: In(ids),
            }
        })
    }

    async getAllActiveServices() {
        return await this.serviceDetailsRepository.find({
            where: {
                is_submitted: true
            }
        })
    }

    async sendSettingEmail(email: string, service_name: string) {
        const emailContent = ServiceSettingReminder(email, service_name);
        const mailOptions = {
            from: `"${process.env.MAIL_FROM_NAME}" <${process.env.MAIL_FROM_ADDRESS}>`,
            to: email,
            subject: "Update your service availability in Wayplace",
            html: emailContent
        };

        return await this.mailerService.sendEmail(mailOptions);
    }

    async getDueEmailReminders(currentUtc: Date) {
        const reminders = await this.emailReminderRepository.find({
            relations: ["service"]
        });
        // console.log(currentUtc)

        return reminders.filter((reminder) => {
            const offset = TimeZoneUtcOffset[reminder.time_zone];
            if (offset === undefined || !reminder.time || !reminder.day_of_week) {
                return false;
            }

            const localDate = new Date(currentUtc.getTime() + offset * 60 * 60 * 1000);
            const localDay = localDate.getUTCDay() + 1; // Sunday = 1 to match DaysOfWeek enum
            const localHour = localDate.getUTCHours();

            const reminderHour = parseInt(reminder.time.split(":")[0], 10);

            return reminder.day_of_week.map(Number).includes(localDay as DaysOfWeek)
                && reminderHour === localHour;
        });
    }

    async sendReminderEmail(reminder: EmailReminder) {
        const emailContent = ServiceSettingReminder(reminder.email, reminder.service?.name);
        const mailOptions = {
            from: `"${process.env.MAIL_FROM_NAME}" <${process.env.MAIL_FROM_ADDRESS}>`,
            to: reminder.email,
            subject: "Update your service availability in Wayplace",
            html: emailContent
        };

        return await this.mailerService.sendEmail(mailOptions);
    }
}
