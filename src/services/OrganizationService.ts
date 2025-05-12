import AppDataSource from "../../ormconfig";
import {Users} from "../entity/Users.entity";
import {Constants} from "../helper/Constants";
import {randomBytes} from "crypto";
import {PasswordReset} from "../entity/PasswordReset.entity";
import {ActivateOrganization, CreatePassword, PasswordResetEmail, SendInvitationEmail} from "../helper/Emails";
import {type} from "node:os";
import {EmailService} from "./EmailService";
import {IsNull, Not} from "typeorm";
import {OrganizationDetails} from "../entity/OrganizationDetails.entity";
import Joi from "joi";
import {Organization} from "../entity/Organization.entity";
import {ResponseFormatter} from "../helper/ResponseFormatter";

export class OrganizationService {
    private userRepository = AppDataSource.getRepository(Users);
    private organizationRepository = AppDataSource.getRepository(Organization);
    private passwordResetRepository = AppDataSource.getRepository(PasswordReset);
    private organizationDetailsRepository = AppDataSource.getRepository(OrganizationDetails);
    private mailerService = new EmailService();

    async getOrganizations(filter: string) {
        if (filter === "all") {
            return await this.userRepository
                .createQueryBuilder('user')
                .leftJoinAndSelect('user.organization', 'organization')
                .leftJoinAndSelect('organization.affiliations', 'affiliations')
                .leftJoinAndSelect('affiliations.affiliation', 'registrationOption')
                .andWhere('user.role_id = :roleId', { roleId: Constants.ROLE_ORGANIZATION })
                .andWhere('organization.is_active = :orgActive', { orgActive: true })
                .getMany();
        }
        if (filter === "pending") {
            return await this.userRepository
                .createQueryBuilder('user')
                .leftJoinAndSelect('user.organization', 'organization')
                .leftJoinAndSelect('organization.affiliations', 'affiliations')
                .leftJoinAndSelect('affiliations.affiliation', 'registrationOption')
                .andWhere('user.role_id = :roleId', { roleId: Constants.ROLE_ORGANIZATION })
                .andWhere('organization.is_active = :orgActive', { orgActive: false })
                .getMany();
        }
    }

    async updateStatus(organization_id: number) {
        const organization = await this.userRepository.findOne({
            where: {
                organization: {id: organization_id},
                role: {id: Constants.ROLE_ORGANIZATION}
            },
            relations: ['organization']
        })
        if (organization) {
            if (organization.organization.is_active == true) {
                organization.organization.is_active = false
                await this.organizationRepository.save(organization.organization);
                return organization.organization;
            }
            if (organization.organization.is_active == false) {
                organization.organization.is_active = true
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
                await this.organizationRepository.save(organization.organization);
                return organization.organization;
            }
        }
    }

    async addOrganizationSettings(organization_id: number, body: any) {
        const addService = await this.organizationDetailsRepository.create({
            organization: {id: organization_id},
            name: body.name,
            service_type: body.service_type,
            client_slots: body.client_slots,
            client_slots_available: body.client_slots,
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

            trafficking_status: body.trafficking_status,
            legal: body.legal,
            health_needs: body.health_needs,
            medications: body.medications,
            mental_health_diagnoses: body.mental_health_diagnoses,
            physical_accommodations: body.physical_accommodations,
            smoking_allowed: body.smoking_allowed,
            entry_requirement: body.entry_requirement,
            days_sober: body.days_sober,

            service_model: body.service_model,
            faith_engagement: body.faith_engagement,
            faith_engagement_practice: body.faith_engagement_practice,
            service_structure: body.service_structure,
            sleeping_arrangement: body.sleeping_arrangement,
            staffing_level: body.staffing_level,
            teams_diversity: body.teams_diversity,
            service_guidelines: body.service_guidelines,

            support_provided: body.support_provided,
            support_offered: body.support_offered,
            intake_process: body.intake_process,
            additional_requirements: body.additional_requirements,
            reason_for_removal: body.reason_for_removal,
            is_submitted: body.is_submitted === true || body.is_submitted === 'true'
        })
        return await this.organizationDetailsRepository.save(addService)
    }

    async editOrganizationSettings(id: number, organization_id: number, body: any) {
        const getService = await this.organizationDetailsRepository.findOne({
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

            getService.trafficking_status = body.trafficking_status
            getService.legal = body.legal
            getService.health_needs = body.health_needs
            getService.medications = body.medications
            getService.mental_health_diagnoses = body.mental_health_diagnoses
            getService.physical_accommodations = body.physical_accommodations
            getService.smoking_allowed = body.smoking_allowed
            getService.entry_requirement = body.entry_requirement
            getService.days_sober = body.days_sober

            getService.service_model = body.service_model
            getService.faith_engagement = body.faith_engagement
            getService.faith_engagement_practice = body.faith_engagement_practice
            getService.service_structure = body.service_structure
            getService.sleeping_arrangement = body.sleeping_arrangement
            getService.staffing_level = body.staffing_level
            getService.teams_diversity = body.teams_diversity
            getService.service_guidelines = body.service_guidelines

            getService.support_provided = body.support_provided
            getService.support_offered = body.support_offered
            getService.intake_process = body.intake_process
            getService.additional_requirements = body.additional_requirements
            getService.reason_for_removal = body.reason_for_removal
            getService.is_submitted = body.is_submitted === true || body.is_submitted === 'true';
            return await this.organizationDetailsRepository.save(getService)
        }
        return false
    }

    async checkIfValidOrganization(id: number, organization_id: number) {
        return await this.organizationDetailsRepository.findOne({
            where: {
                id: id,
                organization: {id: organization_id}
            }
        })
    }

    async getOrganizationsService(organization: number) {
        return await this.organizationDetailsRepository.find({
            where: {
                organization: {id: organization}
            }
        })
    }

    async getOrganizationsServiceById(id: number) {
        return await this.organizationDetailsRepository.find({
            where: {
                id: id
            }
        })
    }

    async getOrganizationsById(id: number) {
        return await this.userRepository
            .createQueryBuilder('user')
            .leftJoinAndSelect('user.organization', 'organization')
            .leftJoinAndSelect('organization.affiliations', 'affiliations')
            .leftJoinAndSelect('affiliations.affiliation', 'registrationOption')
            .andWhere('user.role_id = :roleId', { roleId: Constants.ROLE_ORGANIZATION })
            .andWhere('organization.id = :orgId', { orgId: id })
            .getOne();
    }

    async checkIfEmailAlreadyInUse(email: string) {
        return await this.userRepository.findOne({
            where: {
                email
            }
        })

    }

    async sendInvitation(email: string, role: number, organization_id: number, organization_name: string) {
        const sendInvitation = await this.userRepository.create({
            email: email,
            role: {id: role},
            organization: {id: organization_id},
        })
        const token = randomBytes(32).toString('hex');
        const invitation = await this.userRepository.save(sendInvitation)
        const password_reset_request = this.passwordResetRepository.create({
            email: email,
            token,
            type: Constants.SEND_INVITATION,
            user: {id: sendInvitation.id}
        })
        await this.passwordResetRepository.save(password_reset_request)
        if (invitation) {
            const emailContent = SendInvitationEmail(email, token, Constants.SEND_INVITATION, role, organization_name);
            const mailOptions = {
                from: `"${process.env.MAIL_FROM_NAME}" <${process.env.MAIL_FROM_ADDRESS}>`,
                to: email,
                subject: "Email from Atlas free!",
                html: emailContent
            };
            await this.mailerService.sendEmail(mailOptions);
        }
        return invitation
    }

    async resendInvitation(user_id: number, email: string, role: number, organization_id: number, organization_name: string) {
        const token = randomBytes(32).toString('hex');
        const password_reset_request = this.passwordResetRepository.create({
            email: email,
            token,
            type: Constants.SEND_INVITATION,
            user: {id: user_id}
        })
        const password_resets = await this.passwordResetRepository.save(password_reset_request)
        if (password_resets) {
            const emailContent = SendInvitationEmail(email, token, Constants.SEND_INVITATION, role, organization_name);
            const mailOptions = {
                from: `"${process.env.MAIL_FROM_NAME}" <${process.env.MAIL_FROM_ADDRESS}>`,
                to: email,
                subject: "Email from Atlas free!",
                html: emailContent
            };
            await this.mailerService.sendEmail(mailOptions);
        }
        return password_resets
    }

    async getOrgUsers(organization_id: number) {
        return await this.userRepository.find({
            where: {
                organization: {id: organization_id},
                is_active: true,
                is_status: true
            },
            order: {created_at: "DESC"}
        })
    }
}
