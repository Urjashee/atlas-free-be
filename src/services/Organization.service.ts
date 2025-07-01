import AppDataSource from "../../ormconfig";
import {Users} from "../entity/Users.entity";
import {Constants} from "../helper/Constants.helper";
import {randomBytes} from "crypto";
import {PasswordReset} from "../entity/PasswordReset.entity";
import {ActivateOrganization, CreatePassword, PasswordResetEmail, SendInvitationEmail} from "../helper/Emails.helper";
import {type} from "node:os";
import {EmailService} from "./Email.service";
import {Equal, FindOptionsWhere, IsNull, LessThanOrEqual, Like, MoreThan, MoreThanOrEqual, Not} from "typeorm";
import {ServiceDetails} from "../entity/ServiceDetails.entity";
import Joi from "joi";
import {Organization} from "../entity/Organization.entity";
import {ResponseFormatter} from "../helper/ResponseFormatter.helper";
import {ServiceSetting} from "../entity/ServiceSetting.entity";
import {EmailReminder} from "../entity/EmailReminder.entity";

export class OrganizationService {
    private userRepository = AppDataSource.getRepository(Users);
    private organizationRepository = AppDataSource.getRepository(Organization);
    private passwordResetRepository = AppDataSource.getRepository(PasswordReset);
    private serviceDetailsRepository = AppDataSource.getRepository(ServiceDetails);
    private serviceSettingRepository = AppDataSource.getRepository(ServiceSetting);
    private emailReminderRepository = AppDataSource.getRepository(EmailReminder);
    private mailerService = new EmailService();

    async getOrganizations(filter: string) {
        if (filter === "all") {
            return await this.userRepository
                .createQueryBuilder('user')
                .leftJoinAndSelect('user.organization', 'organization')
                .leftJoinAndSelect('organization.affiliations', 'affiliations')
                .leftJoinAndSelect('affiliations.affiliation', 'registrationOption')
                .andWhere('user.role_id = :roleId', {roleId: Constants.ROLE_ORGANIZATION})
                .andWhere('organization.is_active = :orgActive', {orgActive: true})
                .getMany();
        }
        if (filter === "pending") {
            return await this.userRepository
                .createQueryBuilder('user')
                .leftJoinAndSelect('user.organization', 'organization')
                .leftJoinAndSelect('organization.affiliations', 'affiliations')
                .leftJoinAndSelect('affiliations.affiliation', 'registrationOption')
                .andWhere('user.role_id = :roleId', {roleId: Constants.ROLE_ORGANIZATION})
                .andWhere('organization.is_active = :orgActive', {orgActive: false})
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
                        user: {id: organization.id}
                    })
                    await this.passwordResetRepository.save(password_reset_request);
                    const emailContent = CreatePassword(organization.user_name, organization.email, token, Constants.CREATE_PASSWORD, organization.role.id);
                    const mailOptions = {
                        from: `"${process.env.MAIL_FROM_NAME}" <${process.env.MAIL_FROM_ADDRESS}>`,
                        to: organization.email,
                        subject: "Email from Atlas free!",
                        html: emailContent
                    };
                    await this.mailerService.sendEmail(mailOptions);

                } else if (organization.emailVerifiedAt) {
                    organization.is_status = true
                    const password_reset_request = this.passwordResetRepository.create({
                        email: organization.email,
                        token,
                        type: Constants.CREATE_PASSWORD,
                        user: {id: organization.id}
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

    async addServiceDetails(organization_id: number, role: number, body: any, user_id?: number) {
        const addService = await this.serviceDetailsRepository.create({
            organization: {id: organization_id},
            name: body.name,
            street: body.street,
            address: body.address,
            state: body.state,
            city: body.city,
            zipcode: body.zipcode,
            disclose_address: body.disclose_address === true || body.disclose_address === 'true',
            is_organization_address: body.is_organization_address === true || body.is_organization_address === 'true',
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
            is_submitted: body.is_submitted === true || body.is_submitted === 'true',
            role: {id: role},
            user: {id: user_id}
        })
        return await this.serviceDetailsRepository.save(addService)
    }

    async editServiceDetails(id: number, organization_id: number, role: number, body: any, user_id?: number) {
        const getService = await this.serviceDetailsRepository.findOne({
            where: {
                id: id,
                organization: {id: organization_id},
            }
        })
        if (getService) {
            getService.name = body.name
            getService.street = body.street
            getService.address = body.address
            getService.state = body.state
            getService.city = body.city
            getService.zipcode = body.zipcode
            getService.disclose_address = body.disclose_address === true || body.disclose_address === 'true';
            getService.is_organization_address = body.is_organization_address === true || body.is_organization_address === 'true';
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
            return await this.serviceDetailsRepository.save(getService)
        }
        return false
    }

    async checkIfValidOrganization(id: number, organization_id: number) {
        return await this.serviceDetailsRepository.findOne({
            where: {
                id: id,
                organization: {id: organization_id}
            }
        })
    }

    async getOrganizationsService(organization: number) {
        return await this.serviceDetailsRepository.find({
            where: {
                organization: {id: organization}
            }
        })
    }

    async getOrganizationsServiceById(id: number) {
        return await this.serviceDetailsRepository.find({
            where: {
                id: id
            },
            relations: ['organization']
        })
    }

    async getOrganizationsById(id: number) {
        return await this.userRepository
            .createQueryBuilder('user')
            .leftJoinAndSelect('user.organization', 'organization')
            .leftJoinAndSelect('organization.affiliations', 'affiliations')
            .leftJoinAndSelect('affiliations.affiliation', 'registrationOption')
            .andWhere('user.role_id = :roleId', {roleId: Constants.ROLE_ORGANIZATION})
            .andWhere('organization.id = :orgId', {orgId: id})
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

    async getServices(page_number: number, page_size: number, service_type: number,
                      state: number, city: string, zipcode: string, availability: string, structure,
                      staffing: number, substance, children: string, faith, living_arrangement,
                      guidelines, staff_diversity) {

        const baseWhere: any = {
            service_type,
        };

        if (city) {
            baseWhere.city = city;
        }

        if (state) {
            baseWhere.state = state;
        }

        if (zipcode) {
            baseWhere.zipcode = zipcode;
        }

        if (availability === "true") {
            baseWhere.waitlist = true;
        } else if (availability === "false") {
            baseWhere.waitlist = false;
        }

        if (staffing) {
            baseWhere.staffing_level = staffing;
        }

        if (structure) {

        }

        let where: FindOptionsWhere<any>[] | FindOptionsWhere<any> = baseWhere;
        if (children === "true") {
            where = [
                { ...baseWhere, served_to: Like('%17%') },
                { ...baseWhere, served_to: Like('%18%') }
            ];
        }

        const service = await this.serviceDetailsRepository.find({
            where,
            skip: (page_number - 1) * page_size,
            take: page_size,
        });

        return service;
    }

    async checkIfOrganization(organization_id: number) {
        return await this.organizationRepository.findOne({
            where: {
                id: organization_id,
            }
        })
    }

    async checkIfServiceSettingsExists(service_id: number) {
        return await this.serviceSettingRepository.findOne({
            where: {
                service: {id: service_id}
            }
        })
    }

    async addServiceSettings(body: any) {
        const serviceSetting = await this.serviceSettingRepository.create({
            service: {id: body.service_id},
            available_slots: body.available_slots,
            service_manager: body.service_manager,
            contact_email: body.contact_email,
            contact_phone: body.contact_phone,
        })
        const addServiceSetting = await this.serviceSettingRepository.save(serviceSetting);
        console.log(body.emailReminders)
        for (const emailReminder of body.emailReminders) {
            const email = await this.emailReminderRepository.create({
                service: {id: body.service_id},
                email: emailReminder.email,
                day_of_week: emailReminder.day_of_week,
                time: emailReminder.time,
                time_zone: emailReminder.time_zone,
            })
            await this.emailReminderRepository.save(email);
        }
        return addServiceSetting
    }

    async editServiceSettings(body: any) {
        const serviceSetting = await this.serviceSettingRepository.findOne({
            where: {
                service: {id: body.service_id}
            }
        })
        console.log(serviceSetting)
        if (serviceSetting) {
            serviceSetting.available_slots = body.available_slots;
            serviceSetting.service_manager = body.service_manager;
            serviceSetting.contact_email = body.contact_email;
            serviceSetting.contact_phone = body.contact_phone;
            await this.serviceSettingRepository.save(serviceSetting);
        } else {
            return false;
        }
        const existingReminders = await this.emailReminderRepository.find({
            where: { service: { id: body.service_id } },
        });

        const incoming = body.emailReminders || [];

        // Force all processedIds to be numbers
        const processedIds: number[] = [];

        for (const reminder of incoming) {
            if (reminder.id) {
                const reminderId = parseInt(reminder.id); // ✅ ensure numeric ID

                // Check if this ID actually exists
                const existing = existingReminders.find(er => er.id === reminderId);
                if (existing) {
                    await this.emailReminderRepository.update(reminderId, {
                        email: reminder.email,
                        day_of_week: reminder.day_of_week,
                        time: reminder.time,
                        time_zone: reminder.time_zone,
                    });
                    processedIds.push(reminderId);
                } else {
                    console.warn(`Skipping update: reminder ID ${reminderId} not found.`);
                }
            } else {
                // Create new reminder
                const newReminder = this.emailReminderRepository.create({
                    service: { id: body.service_id },
                    email: reminder.email,
                    day_of_week: reminder.day_of_week,
                    time: reminder.time,
                    time_zone: reminder.time_zone,
                });
                const saved = await this.emailReminderRepository.save(newReminder);
                processedIds.push(saved.id);
            }
        }

        // Delete only those that are not in processed list
        for (const existing of existingReminders) {
            if (!processedIds.includes(existing.id)) {
                await this.emailReminderRepository.remove(existing);
            }
        }
        return serviceSetting;
    }

    async getServiceSettingsById(service_id: number) {
        return await this.serviceSettingRepository.findOne({
            where: {
                service: {id: service_id}
            },
        })
    }

    async getEmailRemindersByServiceId(service_id: number) {
        return await this.emailReminderRepository.find({
            where: {
                service: {id: service_id}
            },
        })
    }

    async getServiceManager(service_managers: any) {
        const userArray = []
        for (const service_manager of service_managers) {
            const user = await this.userRepository.findOne({
                where: {
                    id: service_manager
                },
            })
            userArray.push({
                id: user.id,
                name: `${user.first_name} ${user.last_name}`,
            })
        }
        return userArray
    }
}
