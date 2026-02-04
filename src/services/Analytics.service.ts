import AppDataSource from "../../ormconfig";
import {Users} from "../entity/Users.entity";
import {Constants} from "../helper/Constants.helper";
import {randomBytes} from "crypto";
import {PasswordReset} from "../entity/PasswordReset.entity";
import {
    ActivateOrganization,
    CreatePassword,
    PasswordResetEmail, ReportUserEmail,
    SendInvitationEmail,
    VerifyEmail
} from "../helper/Emails.helper";
import {type} from "node:os";
import {EmailService} from "./Email.service";
import {Equal, FindOptionsWhere, In, IsNull, LessThanOrEqual, Like, MoreThan, MoreThanOrEqual, Not, Raw} from "typeorm";
import {ServiceDetails} from "../entity/ServiceDetails.entity";
import Joi from "joi";
import {Organization} from "../entity/Organization.entity";
import {ResponseFormatter} from "../helper/ResponseFormatter.helper";
import {ServiceSetting} from "../entity/ServiceSetting.entity";
import {EmailReminder} from "../entity/EmailReminder.entity";
import {AssignedServices, ClientStatus} from "../entity/AssignedServices.entity";
import {ReportUser} from "../entity/ReportUser";
import {ClientService} from "../entity/ClientService.entity";
import {ReportService} from "../entity/ReportService.entity";
import {Affiliations} from "../entity/Affiliations.entity";

export class AnalyticsService {
    private userRepository = AppDataSource.getRepository(Users);
    private organizationRepository = AppDataSource.getRepository(Organization);
    private passwordResetRepository = AppDataSource.getRepository(PasswordReset);
    private serviceDetailsRepository = AppDataSource.getRepository(ServiceDetails);
    private emailReminderRepository = AppDataSource.getRepository(EmailReminder);
    private assignedServiceRepository = AppDataSource.getRepository(AssignedServices);
    private reportUserRepository = AppDataSource.getRepository(ReportUser);
    private reportServiceRepository = AppDataSource.getRepository(ReportService);
    private clientServiceRepository = AppDataSource.getRepository(ClientService);
    private affiliationRepository = AppDataSource.getRepository(Affiliations);
    private mailerService = new EmailService();

    async getOrganizationCount(from_date?: string, to_date?: string) {
        const query = this.organizationRepository.createQueryBuilder("org");

        if (from_date && to_date) {
            query.andWhere(
                "org.created_at BETWEEN :from AND :to",
                {
                    from: new Date(from_date),
                    to: new Date(to_date),
                }
            );
        }

        return await query.getCount();
        // return count;
    }

    async getServiceCount(from_date?: string, to_date?: string) {
        const query = this.serviceDetailsRepository.createQueryBuilder("service");

        if (from_date && to_date) {
            query.andWhere(
                "service.created_at BETWEEN :from AND :to",
                {
                    from: new Date(from_date),
                    to: new Date(to_date),
                }
            );
        }

        return await query.getCount();
        // return count;
    }

    async getUserCount(type: number, from_date?: string, to_date?: string) {
        const query = this.userRepository
            .createQueryBuilder("user")
            .where("user.role = :type", {type});

        if (from_date && to_date) {
            query.andWhere(
                "user.created_at BETWEEN :from AND :to",
                {
                    from: new Date(from_date),
                    to: new Date(to_date),
                }
            );
        }

        return await query.getCount();
        // return count;
    }

    async getServiceRequestCount(status?: number, from_date?: string, to_date?: string) {
        const query = this.assignedServiceRepository
            .createQueryBuilder("service_request");

        if (status) {
            query.andWhere("service_request.status = :status", {status});
        }

        if (from_date && to_date) {
            query.andWhere(
                "service_request.created_at BETWEEN :from AND :to",
                {
                    from: new Date(from_date),
                    to: new Date(to_date),
                }
            );
        }

        return await query.getCount();
        // return count;
    }

}

