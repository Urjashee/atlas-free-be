import AppDataSource from "../../ormconfig";
import {Users} from "../entity/Users.entity";
import {Organization} from "../entity/Organization.entity";
import {PasswordReset} from "../entity/PasswordReset.entity";
import {ServiceDetails} from "../entity/ServiceDetails.entity";
import {AssignedServices, ClientStatus} from "../entity/AssignedServices.entity";
import {ReportService} from "../entity/ReportService.entity";
import {DeviceToken} from "../entity/DeviceToken.entity";
import {Affiliations} from "../entity/Affiliations.entity";
import {ClientService as ClientServiceEntity} from "../entity/ClientService.entity";
import Joi from "joi";
import {Constants} from "../helper/Constants.helper";
import {ReportUserEmail} from "../helper/Emails.helper";
import {EmailService} from "./Email.service";

export class ClientService {
    private userRepository = AppDataSource.getRepository(Users);
    private organizationRepository = AppDataSource.getRepository(Organization);
    private passwordResetRepository = AppDataSource.getRepository(PasswordReset);
    private serviceDetailsRepository = AppDataSource.getRepository(ServiceDetails);
    private clientServiceRepository = AppDataSource.getRepository(ClientServiceEntity);
    private assignedServiceRepository = AppDataSource.getRepository(AssignedServices);
    private reportServiceRepository = AppDataSource.getRepository(ReportService);
    private mailerService = new EmailService();

    async findExistingServices(organization_id: number,) {
        const services = await this.assignedServiceRepository.find({})
    }

    async addService(body: any, user_id: number) {
        let case_no: string;

        let isUnique = false;

        while (!isUnique) {
            case_no = generateTenDigitNumber().toString();
            const existing = await this.assignedServiceRepository.findOne({
                where: {case_no},
            });
            if (!existing) {
                isUnique = true;
            }
        }
        const addService = await this.assignedServiceRepository.create({
            organization: {id: body.organization_id},
            user: {id: user_id},
            client_service: {id: body.client_service_id},
            service: {id: body.service_id},
            case_no
        })

        return await this.assignedServiceRepository.save(addService)
    }

    async getServiceRequests(user_id: number, page_number = 1, page_size = 10, status?: number) {
        const skip = (page_number - 1) * page_size;

        const where: any = {
            user: { id: user_id },
        };

        if (typeof status === 'number' && status !== ClientStatus.All) {
            where.status = status;
        }

        const [data, total] = await this.assignedServiceRepository.findAndCount({
            where,
            relations: ["organization", "service", "service.state", "client_service"],
            skip,
            take: page_size,
            order: { created_at: "DESC" }
        });

        return { data, total };
    }


    async getServiceRequestById(id: number) {
        return await this.assignedServiceRepository.findOne({
            where: {
                id
            },
            relations: ["organization", "service", "client_service", "user"]
        });
    }

    async getClientServiceById(id: number) {
        return await this.clientServiceRepository.findOne({
            where: {
                id
            },
        });
    }

    async checkIfValidServiceRequest(id: number, user_id: number) {
        return await this.assignedServiceRepository.findOne({
            where: {
                id,
                user: {id: user_id},
            }
        });
    }

    async reportService(id: number, reason: string, body: any) {
        const createReport = await this.reportServiceRepository.create({
            reason: reason,
            organization: {id: body.organization.id},
            user: {id: body.user.id},
            service: {id: body.service.id}
        })
        const reportedService = await this.serviceDetailsRepository.findOne({
            where: { id: body.service.id }
        });

        const emailContent = ReportUserEmail(reportedService.name, reason, "service");
        const mailOptions = {
            from: `"${process.env.MAIL_FROM_NAME}" <${process.env.MAIL_FROM_ADDRESS}>`,
            to: process.env.SUPER_ADMIN_MAIN,
            subject: "Email from Atlas free!",
            html: emailContent
        };
        await this.mailerService.sendEmail(mailOptions)
        return await this.reportServiceRepository.save(createReport);
    }

    async cancelServiceRequest(id: number) {
        const getServiceRequest = await this.assignedServiceRepository.findOne({
            where: {
                id
            }
        })
        if (getServiceRequest) {
            return await this.assignedServiceRepository.delete(getServiceRequest.id);
        } else {
            throw new Error("Service request not found");
        }
    }


    async addClient(user_id: number, organization_id: number, body: any, client_id?: number) {
        const addService = await this.clientServiceRepository.create({
            client: {id: user_id},
            service: body.service,
            zipcode: body.zipcode,
            dob: body.dob,
            english_speaking_ability: body.english_speaking_ability,
            gender: body.gender,
            citizenship_status: body.citizenship_status,
            client_experienced: body.client_experienced,
            pregnant: body.pregnant,
            pregnant_months: body.pregnant_months,
            birthdate_status: body.birthdate_status,
            children_accompany: body.children_accompany,
            children_to_accompany: body.children_to_accompany,
            criteria: body.criteria,
        })

        return await this.clientServiceRepository.save(addService);
    }

    async editClient(id: number, user_id: number, organization_id: number, body: any, client_id?: number) {
        const getClient = await this.clientServiceRepository.findOne({
            where: {
                id: id,
                client: {id: client_id},
            }
        })
        if (getClient) {
            getClient.service = body.service
            getClient.zipcode = body.zipcode
            getClient.dob = body.dob
            getClient.english_speaking_ability = body.english_speaking_ability
            getClient.gender = body.gender
            getClient.citizenship_status = body.citizenship_status
            getClient.client_experienced = body.client_experienced
            getClient.pregnant = body.pregnant
            getClient.pregnant_months = body.pregnant_months
            getClient.birthdate_status = body.birthdate_status
            getClient.children_accompany = body.children_accompany
            getClient.children_to_accompany = body.children_to_accompany
            getClient.criteria = body.criteria
            return await this.clientServiceRepository.save(getClient);
        }
        return false
    }

    async checkIfValidClient(id: number, client_id: number) {
        return await this.clientServiceRepository.findOne({
            where: {
                id,
                client: {id: client_id},
            }
        })
    }
    async getClients(client_id: number) {
        return await this.clientServiceRepository.find({
            where: {
                client: {id: client_id},
            },
            order: {created_at: "DESC"}
        })
    }
    async getRequestsById(id: number) {
        return await this.clientServiceRepository.find({
            where: {
                id
            }
        })
    }

    async checkIfSurvivor(survivor_id: number) {
        return await this.userRepository.findOne({
            where: {
                id: survivor_id,
                role: {id: Constants.ROLE_SURVIVOR},
            }
        })
    }

    async checkIfClientService(id: number, client_id: number) {
        return await this.clientServiceRepository.findOne({
            where: {
                id,
                client: {id: client_id},
            }
        })
    }
    async getClientsById(client_id: number) {
        return await this.clientServiceRepository.find({
            where: {
                client: {id: client_id},
            }
        })
    }

    async updateServiceRequestStatus(id: number, status: ClientStatus) {
        const serviceRequest = await this.assignedServiceRepository.findOne({
            where: { id }
        });

        if (!serviceRequest) {
            throw new Error("Service request not found");
        }

        serviceRequest.status = status;
        return await this.assignedServiceRepository.save(serviceRequest);
    }

}

function generateTenDigitNumber() {
    const min = 100000000000;
    const max = 999999999999;
    return Math.floor(Math.random() * (max - min + 1)) + min;
}
