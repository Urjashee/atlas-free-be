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
import {
    PendingOrganization,
    ReportUserEmail,
    SendServiceRequest,
    SendServiceRequestClient,
    SurvivorReportReceipt
} from "../helper/Emails.helper";
import {EmailService} from "./Email.service";
import {In, Not} from "typeorm";
import {NotificationService} from "./Notification.service";

export class ClientService {
    private userRepository = AppDataSource.getRepository(Users);
    private organizationRepository = AppDataSource.getRepository(Organization);
    private passwordResetRepository = AppDataSource.getRepository(PasswordReset);
    private serviceDetailsRepository = AppDataSource.getRepository(ServiceDetails);
    private clientServiceRepository = AppDataSource.getRepository(ClientServiceEntity);
    private assignedServiceRepository = AppDataSource.getRepository(AssignedServices);
    private reportServiceRepository = AppDataSource.getRepository(ReportService);
    private mailerService = new EmailService();
    private notificationService = new NotificationService();

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

    async checkIfBelongsToOrganization(organization_id: number, service_id: number) {
        const service =await this.serviceDetailsRepository.findOne({
            where: {
                id: service_id,
                organization: {
                    id: organization_id,
                }
            }
        })
        if (service)
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

        // await this.updateServiceRequestStatus(addService.id, Constants.PENDING);

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

    async reportService(id: number, reason: string, body: any, user_email?: string) {
        console.log("user_email: ", user_email);
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
        const user = await this.userRepository.findOne({
            where: {
                email: user_email
            }
        })
        console.log("User: ", user)
        if (user) {
            const emailReportContent = SurvivorReportReceipt(user.user_name != null ? user.user_name : user.email)
            const mailOptions = {
                from: `"${process.env.MAIL_FROM_NAME}" <${process.env.MAIL_FROM_ADDRESS}>`,
                to: user.email,
                subject: "Email from Atlas free!",
                html: emailReportContent
            };
            await this.mailerService.sendEmail(mailOptions)
        }
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
            ages_of_children: body.ages_of_children || null,
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
            getClient.ages_of_children = body.ages_of_children || null
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
            relations: ["user", "client_service", "organization", "service", "client_service.client"]
        });
        console.log("serviceRequest:", serviceRequest)
        if (!serviceRequest) {
            throw new Error("Service request not found");
        }

        serviceRequest.status = status;
        const saved = await this.assignedServiceRepository.save(serviceRequest);

        try {
        if (serviceRequest.user?.role?.id == Constants.ROLE_ORGANIZATION_ADMIN || serviceRequest.user?.role?.id == Constants.ROLE_ADVOCATE ) {

            const name = serviceRequest.user.email || `${serviceRequest.user.first_name} ${serviceRequest.user.last_name}`
            const organization_name = serviceRequest.organization.name
            const service_name = serviceRequest.service.name

            let contact_email = serviceRequest.service?.contact_email || ""
            let contact_phone = serviceRequest.service?.contact_phone || ""


            let emailTemplate_line1: string = ""
            let emailTemplate_line2: string = ""
            let emailTemplate_line3: string = ""
            let emailTemplate_line4: string = ""
            let subject = ""

            if (status == Constants.PENDING) {
                emailTemplate_line1 = `Success! `
                emailTemplate_line2 = `A service request for ${service_name} was just <b>requested</b> in Wayplace.`
                emailTemplate_line3 = `If this is incorrect, please reach out to wayplace@atlasfree.org`
                subject = `An individual has made a request for ${service_name} in Wayplace`
                contact_email = ""
                contact_phone = ""
            }

            if (status == Constants.PLACED) {
                emailTemplate_line1 = ``
                emailTemplate_line2 = `A service request for ${service_name} was just <b>placed</b> in Wayplace. 
            This means you have completed your screening and have begun serving this individual.`
                emailTemplate_line3 = `If this is incorrect, please reach out to wayplace@atlasfree.org`
                subject = `An individual has been placed for ${service_name} in Wayplace`
                contact_email = ""
                contact_phone = ""
            }

            if (status == Constants.UNABLE_TO_SERVE) {
                emailTemplate_line1 = `A service request for ${service_name} was just <b>unable to serve</b> in Wayplace. 
            This means you have reviewed the individual’s details and decided you were not in a position to serve the individual at this time. 
            The individual has been notified and encouraged to consider sending their service request to another service.`
                subject = `An individual has been changed to ‘Unable to Serve’ for ${service_name} in Wayplace`
                contact_email = ""
                contact_phone = ""
            }

            if (status == Constants.WAITLISTED) {
                emailTemplate_line1 = `A service request for ${service_name} was just <b>waitlisted</b> in Wayplace. 
            The individual has been sent the following information, in order to reach out to your organization.`
                emailTemplate_line2 = `Wayplace does not replace your organization’s processes. 
                When the individual reaches out, you are welcome to go through your organization’s typical screening and waitlist process.`
                emailTemplate_line3 = `If the contact information above needs to be updated, 
            please edit that in the service settings for ${service_name} in Wayplace.`
                subject = `An individual has been waitlisted for ${service_name} in Wayplace`
                contact_email = `Contact email: ${serviceRequest.service?.contact_email}; `
                contact_phone = `Contact phone: ${serviceRequest.service?.contact_phone}`
            }

            if (status == Constants.CANCELLED) {
                emailTemplate_line1 = `A service request for ${service_name} was just changed to <b>canceled</b> in Wayplace. 
            This means the individual decided not to move forward with services at this time. 
            If the individual changes their mind, they will have the ability to resend this service request.`
                subject = `An individual has ‘Canceled’ for ${service_name} in Wayplace`
                contact_email = ""
                contact_phone = ""
            }

            if (status == Constants.ACCEPTED) {
                emailTemplate_line1 = `A service request for ${service_name} was just <b>matched</b> in Wayplace. 
            The individual has been sent the following information, in order to reach out to your organization.`
                emailTemplate_line2 = `Wayplace does not replace your intake process. When the individual reaches out, 
            you are welcome to go through your organization’s typical screening and onboarding steps.`
                emailTemplate_line3 = `If the contact information above needs to be updated, 
            please edit that in the service settings for ${service_name} in Wayplace.`
                subject = `An individual has been matched for ${service_name} in Wayplace`
                contact_email = `Contact email: ${serviceRequest.service?.contact_email}; `
                contact_phone = `Contact phone: ${serviceRequest.service?.contact_phone}`
            }

            // Emails
            const emailContent = SendServiceRequest(name, emailTemplate_line1, emailTemplate_line2, emailTemplate_line3, contact_email, contact_phone);
            const mailOptions = {
                from: `"${process.env.MAIL_FROM_NAME}" <${process.env.MAIL_FROM_ADDRESS}>`,
                to: serviceRequest.user.email,
                subject: subject,
                html: emailContent
            };
            await this.mailerService.sendEmail(mailOptions);
        }
        if (serviceRequest.client_service && serviceRequest.client_service.client && serviceRequest.client_service.client.email) {
            const name = serviceRequest.client_service.client.user_name
            const organization_name = serviceRequest.organization.name
            const service_name = serviceRequest.service.name

            let contact_email = serviceRequest.service?.contact_email || ""
            let contact_phone = serviceRequest.service?.contact_phone || ""


            let emailTemplate_line1: string = ""
            let emailTemplate_line2: string = ""
            let emailTemplate_line3: string = ""
            let emailTemplate_line4: string = ""
            let subject = ""

            if (status == Constants.PENDING) {
                emailTemplate_line1 = `Thank you for reaching out to us! `
                emailTemplate_line2 = `We will review your service request and get back to you soon.`
                emailTemplate_line3 = ``
                subject = `New service request`
                contact_email = ""
                contact_phone = ""
            }

            if (status == Constants.PLACED) {
                emailTemplate_line1 = `Congratulations on starting your healing journey! `
                emailTemplate_line2 = `Your service request for ${service_name} was just switched to <b>placed</b> in Wayplace. This means that you have begun receiving services. 
                If you have not started to receive services, please reach out to: wayplace@atlasfree.org.`
                emailTemplate_line3 = `Please know if you ever need more support, we are here to help. `
                subject = `Update on your service request`
                contact_email = ""
                contact_phone = ""
            }

            if (status == Constants.UNABLE_TO_SERVE) {
                emailTemplate_line1 = `We would like to acknowledge your strength and persistence in reaching out for help. 
                It takes courage to seek assistance in regards to the events you’ve experienced.`
                emailTemplate_line2 = `Your service request for ${service_name} was switched to <b>unable to serve</b> in Wayplace. 
                This means that they do not feel they could provide you with the support you deserve. 
                We recommend reviewing your filters and consider sending your service request to other services.`
                subject = `Update on your service request`
                contact_email = ""
                contact_phone = ""
            }

            if (status == Constants.WAITLISTED) {
                emailTemplate_line1 = `We admire your strength in finding programs that can support you. `
                emailTemplate_line2 = `Your service request for ${service_name} was just <b>waitlisted</b> in Wayplace. 
                Below is the information for the service. Please reach out to discuss potential placement.`
                subject = `Update on your service request`
                contact_email = `Contact email: ${serviceRequest.service?.contact_email || ""}; `
                contact_phone = `Contact phone: ${serviceRequest.service?.contact_phone || ""}`
            }

            if (status == Constants.CANCELLED) {
                emailTemplate_line1 = `We would like to acknowledge your strength and persistence in reaching out for help. 
                It takes courage to seek assistance in regards to the events you’ve experienced.`
                emailTemplate_line2 = `According to our system, you <b>canceled</b> your service request for ${service_name} in Wayplace. 
                This means that the organization cannot respond to your request. 
                If you change your mind, you may resubmit a new service request for this service. `
                subject = `Update on your canceled service request`
                contact_email = ""
                contact_phone = ""
            }

            if (status == Constants.ACCEPTED) {
                emailTemplate_line1 = `We admire your strength in finding programs that can support you. `
                emailTemplate_line2 = `Your service request for ${service_name} was just <b>matched</b> in Wayplace. 
                Below is the information for the service. Please reach out to discuss potential placement.`
                subject = `Update on your service request`
                contact_email = `Contact email: ${serviceRequest.service?.contact_email || ""}; `
                contact_phone = `Contact phone: ${serviceRequest.service?.contact_phone || ""}`
            }

            const emailBody = `${emailTemplate_line1}\n${emailTemplate_line2}\n${contact_email}\n${contact_phone}`;
            // Emails
            if (serviceRequest.client_service.client.receive_service_status_emails) {
                const emailContent = SendServiceRequestClient(name, emailTemplate_line1, emailTemplate_line2, emailTemplate_line3, contact_email, contact_phone);
                const mailOptions = {
                    from: `"${process.env.MAIL_FROM_NAME}" <${process.env.MAIL_FROM_ADDRESS}>`,
                    to: serviceRequest.client_service.client.email,
                    subject: subject,
                    html: emailContent
                };
                await this.mailerService.sendEmail(mailOptions);
            }
            await this.notificationService.add(subject, emailBody, Constants.SERVICE_REQUEST_STATUS_NOTIFICATION, serviceRequest.client_service.client.id)

        }
        } catch (err) {
            console.error("updateServiceRequestStatus notification failed:", err);
        }

        return saved;
    }


}

function generateTenDigitNumber() {
    const min = 100000000000;
    const max = 999999999999;
    return Math.floor(Math.random() * (max - min + 1)) + min;
}
