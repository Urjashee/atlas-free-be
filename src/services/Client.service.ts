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
import {PendingOrganization, ReportUserEmail, SendServiceRequest} from "../helper/Emails.helper";
import {EmailService} from "./Email.service";
import {In, Not} from "typeorm";

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

    async checkDuplicateServiceRequest(body: any, user_id: number) {
        const status_checks = [Constants.UNABLE_TO_SERVE, Constants.PLACED, Constants.CANCELLED];
        const existing = await this.assignedServiceRepository.find({
            where: {
                client_service: {id: body.client_service_id},
                service: {id: body.service_id},
                status: Not(In(status_checks))
            },
        });
        console.log("Existing: ", existing);
        if (existing.length > 0)
            return true

        return false
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
            client_nick_name: body.client_nick_name || "",
            zipcode: body.zipcode,
            dob: body.dob,
            english_speaking_ability: body.english_speaking_ability,
            preferred_language: body.preferred_language || "",
            gender: body.gender || null,
            race: body.race,
            citizenship_status: body.citizenship_status,
            client_experienced: body.client_experienced,
            pregnant: body.pregnant,
            pregnant_months: body.pregnant_months || null,
            birthdate_status: body.birthdate_status || null,
            children_accompany: body.children_accompany || null,
            children_to_accompany: body.children_to_accompany || null,
            criteria: body.criteria,
            criteria_add: body.criteria_add,
            medications: body.medications,
            medications_other: body.medications_other || "",
            mental_health_diagnoses: body.mental_health_diagnoses,
            mental_health_diagnoses_other: body.mental_health_diagnoses_other || "",
            physical_accommodation: body.physical_accommodation,
            specify_physical_accommodation: body.specify_physical_accommodation || "",
            nicotine_products: body.nicotine_products,
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
            getClient.client_nick_name = body.client_nick_name || ""
            getClient.zipcode = body.zipcode
            getClient.dob = body.dob
            getClient.english_speaking_ability = body.english_speaking_ability
            getClient.preferred_language = body.preferred_language || ""
            getClient.gender = body.gender || null
            getClient.race = body.race
            getClient.citizenship_status = body.citizenship_status
            getClient.client_experienced = body.client_experienced
            getClient.pregnant = body.pregnant
            getClient.pregnant_months = body.pregnant_months || null
            getClient.birthdate_status = body.birthdate_status || null
            getClient.children_accompany = body.children_accompany
            getClient.children_to_accompany = body.children_to_accompany
            getClient.criteria = body.criteria
            getClient.criteria_add = body.criteria_add
            getClient.medications = body.medications
            getClient.medications_other = body.medications_other || ""
            getClient.mental_health_diagnoses = body.mental_health_diagnoses
            getClient.mental_health_diagnoses_other = body.mental_health_diagnoses_other || ""
            getClient.physical_accommodation = body.physical_accommodation
            getClient.specify_physical_accommodation = body.specify_physical_accommodation || ""
            getClient.nicotine_products = body.nicotine_products
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
            where: { id },
            relations: ["user", "client_service", "organization", "service"]
        });

        if (!serviceRequest) {
            throw new Error("Service request not found");
        }
        // console.log(serviceRequest)
        // console.log("Status: ", status)
        const name = serviceRequest.client_service.client_nick_name || `${serviceRequest.user.first_name} ${serviceRequest.user.last_name}`
        const organization_name = serviceRequest.organization.name
        const service_name = serviceRequest.service.name

        let contact_email = serviceRequest.service?.contact_email
        let contact_phone = serviceRequest.service?.contact_phone

        // console.log("Contact email: ", contact_email)
        // console.log("Contact phone: ", contact_phone)

        let emailTemplate
        let subject = ""

        if (status == Constants.PLACED) {
            emailTemplate = `${organization_name} has placed your service request for ${service_name} 
            and given you a spot in the service. 
            Please use the information below establish contact with a service representative, 
            they will share additional information on next steps:`
            subject = `Service request placed`
        }

        if (status == Constants.UNABLE_TO_SERVE) {
            emailTemplate = `${organization_name} is unable to place your service request for ${service_name}`
            contact_email = ""
            contact_phone = ""
            subject = `Service request unable to place`
        }

        if (status == Constants.WAITLISTED) {
            emailTemplate = `${organization_name} has waitlisted your service request for ${service_name}`
            contact_email = ""
            contact_phone = ""
            subject = `Service request waitlisted`
        }

        if (status == Constants.CANCELLED) {
            emailTemplate = `${organization_name} has cancelled your service request for ${service_name}`
            contact_email = ""
            contact_phone = ""
            subject = `Service request cancelled`
        }

        if (status == Constants.ACCEPTED) {
            emailTemplate = `${organization_name} has accepted your service request for ${service_name} 
            and given you a spot in the service. 
            Please use the information below establish contact with a service representative, 
            they will share additional information on next steps:`
            subject = `Service request accepted`
        }

        serviceRequest.status = status;
        // Emails
        const emailContent = SendServiceRequest(name, emailTemplate, contact_email, contact_phone);
        const mailOptions = {
            from: `"${process.env.MAIL_FROM_NAME}" <${process.env.MAIL_FROM_ADDRESS}>`,
            to: serviceRequest.user.email,
            subject: subject,
            html: emailContent
        };
        await this.mailerService.sendEmail(mailOptions);

        return await this.assignedServiceRepository.save(serviceRequest);
    }


}

function generateTenDigitNumber() {
    const min = 100000000000;
    const max = 999999999999;
    return Math.floor(Math.random() * (max - min + 1)) + min;
}
