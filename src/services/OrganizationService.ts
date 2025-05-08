import AppDataSource from "../../ormconfig";
import {Users} from "../entity/Users";
import {Profiles} from "../entity/Profiles";
import {Constants} from "../helper/Constants";
import {randomBytes} from "crypto";
import {PasswordReset} from "../entity/PasswordReset";
import {ActivateOrganization, CreatePassword} from "../helper/Emails";
import {type} from "node:os";
import {EmailService} from "./EmailService";
import {IsNull, Not} from "typeorm";
import {OrganizationServiceEntity} from "../entity/OrganizationServiceEntity";

export class OrganizationService {
    private userRepository = AppDataSource.getRepository(Users);
    private profileRepository = AppDataSource.getRepository(Profiles);
    private passwordResetRepository = AppDataSource.getRepository(PasswordReset);
    private organizationServiceRepository = AppDataSource.getRepository(OrganizationServiceEntity);
    private mailerService = new EmailService();

    async getOrganizations(filter: string) {
        if (filter === "all") {

        }
        if (filter === "pending") {
            const organizations = await this.userRepository.find({
                where: {
                    is_active: false,
                    is_status: true
                }
            })
            if (organizations.length > 0) {
                const orgIds = organizations.map(org => org.id);

                return await this.profileRepository
                    .createQueryBuilder("profile")
                    .leftJoinAndSelect("profile.user", "user")
                    .leftJoinAndMapMany(
                        "profile.affiliation",
                        "Affiliations",
                        "affiliation",
                        "affiliation.user.id = user.id"
                    )
                    .leftJoinAndSelect("affiliation.affiliation", "registrationOption")
                    .where("user.id IN (:...ids)", {ids: orgIds})
                    .getMany()
            }
        }
    }

    async updateStatus(organization_id: number) {
        const organization = await this.userRepository.findOne({
            where: {
                id: organization_id,
                role: {id: Constants.ROLE_ORGANIZATION}
            }
        })
        if (organization) {
            if (organization.is_active == true) {
                organization.is_active = false
                return await this.userRepository.save(organization)
            }
            if (organization.is_active == false) {
                organization.is_active = true
                const token = randomBytes(32).toString('hex');
                if (organization.emailVerifiedAt === null) {
                    const password_reset_request = this.passwordResetRepository.create({
                        email: organization.email,
                        token,
                        type: Constants.CREATE_PASSWORD,
                        user: {id: organization_id}
                    })
                    const emailContent = CreatePassword(organization.user_name, organization.email, token, Constants.CREATE_PASSWORD);
                    const mailOptions = {
                        from: `"${process.env.MAIL_FROM_NAME}" <${process.env.MAIL_FROM_ADDRESS}>`,
                        to: organization.email,
                        subject: "Email from Atlas free!",
                        html: emailContent
                    };
                    await this.mailerService.sendEmail(mailOptions);
                    await this.passwordResetRepository.save(password_reset_request);

                } else if (organization.emailVerifiedAt) {
                    organization.is_status = true
                    const password_reset_request = this.passwordResetRepository.create({
                        email: organization.email,
                        token,
                        type: Constants.CREATE_PASSWORD,
                        user: {id: organization_id}
                    })
                    const emailContent = ActivateOrganization(organization.user_name, organization.email, token, Constants.ACTIVATE_ORGANIZATION);
                    const mailOptions = {
                        from: `"${process.env.MAIL_FROM_NAME}" <${process.env.MAIL_FROM_ADDRESS}>`,
                        to: organization.email,
                        subject: "Email from Atlas free!",
                        html: emailContent
                    };
                    await this.mailerService.sendEmail(mailOptions);
                    await this.passwordResetRepository.save(password_reset_request);

                }
                return await this.userRepository.save(organization)
            }
        }
    }

    async addOrganizationSettings(organization_id: number, body: any) {
        const addService = await this.organizationServiceRepository.create({
            organization: {id: organization_id},
            name: body.name,
            service_type: body.service_type,
            client_slots: body.client_slots,
            slots_beds: body.slots_beds,
            start_day_of_service: body.start_day_of_service,
            service_limited: body.service_limited === true || body.service_limited === 'true',
            enrollment_type: body.enrollment_type,
            enrollment_period: body.enrollment_period,
            extension: body.extension === true || body.extension === 'true',
            waitlist: body.waitlist === true || body.waitlist === 'true',
            service_description: body.service_description,
            minimum_age: body.minimum_age,
            maximum_age: body.maximum_age,
            genders_served: body.genders_served,
            served_to: body.served_to,
            minimum_children_age: body.minimum_children_age,
            maximum_children_age: body.maximum_children_age,
            maximum_children_intake: body.maximum_children_intake,
            citizenship_requirement: body.citizenship_requirement,
            language_requirement: body.language_requirement,
            out_of_state_relocation: body.out_of_state_relocation === true || body.out_of_state_relocation === 'true',
        })
        return await this.organizationServiceRepository.save(addService)
    }

    async editOrganizationSettings(id: number, organization_id: number, body: any) {
        const getService = await this.organizationServiceRepository.findOne({
            where: {
                id: id,
                organization: {id: organization_id},
            }
        })
        if (getService) {
            getService.name = body.name
            getService.service_type = body.service_type
            getService.client_slots = body.client_slots
            getService.slots_beds = body.slots_beds
            getService.start_day_of_service = body.start_day_of_service
            getService.service_limited = body.service_limited === true || body.service_limited === 'true';
            getService.enrollment_type = body.enrollment_type
            getService.enrollment_period = body.enrollment_period
            getService.extension = body.extension === true || body.extension === 'true';
            getService.waitlist = body.waitlist === true || body.waitlist === 'true';
            getService.service_description = body.service_description
            getService.minimum_age = body.minimum_age
            getService.maximum_age = body.maximum_age
            getService.genders_served = body.genders_served
            getService.served_to = body.served_to
            getService.minimum_children_age = body.minimum_children_age
            getService.maximum_children_age = body.maximum_children_age
            getService.maximum_children_intake = body.maximum_children_intake
            getService.citizenship_requirement = body.citizenship_requirement
            getService.language_requirement = body.language_requirement
            getService.out_of_state_relocation = body.out_of_state_relocation === true || body.out_of_state_relocation === 'true'
            return await this.organizationServiceRepository.save(getService)
        }
        return false
    }

    async checkIfValidOrganization(id: number, organization_id: number) {
        return await this.organizationServiceRepository.findOne({
            where: {
                id: id,
                organization: {id: organization_id}
            }
        })
    }


}
