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

export class OrganizationService {
    private userRepository = AppDataSource.getRepository(Users);
    private organizationRepository = AppDataSource.getRepository(Organization);
    private passwordResetRepository = AppDataSource.getRepository(PasswordReset);
    private serviceDetailsRepository = AppDataSource.getRepository(ServiceDetails);
    private emailReminderRepository = AppDataSource.getRepository(EmailReminder);
    private assignedServiceRepository = AppDataSource.getRepository(AssignedServices);
    private reportUserRepository = AppDataSource.getRepository(ReportUser);
    private reportServiceRepository = AppDataSource.getRepository(ReportService);
    private clientServiceRepository = AppDataSource.getRepository(ClientService);
    private mailerService = new EmailService();

    async getOrganizations(filter: string) {
        if (filter === "active") {
            return await this.userRepository
                .createQueryBuilder('user')
                .leftJoinAndSelect('user.organization', 'organization')
                .leftJoinAndSelect('organization.affiliations', 'affiliations')
                .leftJoinAndSelect('affiliations.affiliation', 'registrationOption')
                .andWhere('user.role_id = :roleId', {roleId: Constants.ROLE_ORGANIZATION_ADMIN})
                .andWhere('organization.is_active = :orgActive', {orgActive: true})
                .andWhere('organization.under_review = :underReview', {underReview: false})
                .getMany();
        }
        if (filter === "inactive") {
            return await this.userRepository
                .createQueryBuilder('user')
                .leftJoinAndSelect('user.organization', 'organization')
                .leftJoinAndSelect('organization.affiliations', 'affiliations')
                .leftJoinAndSelect('affiliations.affiliation', 'registrationOption')
                .andWhere('user.role_id = :roleId', {roleId: Constants.ROLE_ORGANIZATION_ADMIN})
                .andWhere('organization.is_active = :orgActive', {orgActive: false})
                .andWhere('organization.under_review = :underReview', {underReview: false})
                // .andWhere('user.is_active = :userActive', {userActive: true})
                .getMany();
        }
        if (filter === "pending") {
            return await this.userRepository
                .createQueryBuilder('user')
                .leftJoinAndSelect('user.organization', 'organization')
                .leftJoinAndSelect('organization.affiliations', 'affiliations')
                .leftJoinAndSelect('affiliations.affiliation', 'registrationOption')
                .andWhere('user.role_id = :roleId', {roleId: Constants.ROLE_ORGANIZATION_ADMIN})
                .andWhere('organization.is_active = :orgActive', {orgActive: true})
                .andWhere('organization.under_review = :underReview', {underReview: true})
                // .andWhere('user.is_active = :userActive', {userActive: true})
                .getMany();
        }
    }

    async updateStatus(organization_id: number) {
        const organization = await this.userRepository.findOne({
            where: {
                organization: {id: organization_id},
                role: {id: Constants.ROLE_ORGANIZATION_ADMIN}
            },
            relations: ['organization']
        })
        if (organization) {
            if (organization.organization.is_active == true && organization.organization.under_review == false) {
                organization.organization.is_active = false
                await this.organizationRepository.save(organization.organization);
                return organization.organization;
            }
            if ((organization.organization.is_active == false) || (organization.organization.is_active == true && organization.organization.under_review == true)) {
                organization.organization.is_active = true
                organization.organization.under_review = false
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
                await this.userRepository.save(organization);
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
            total_available_slots: body.total_available_slots,
            slots_available: body.slots_available,
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
            getService.total_available_slots = body.client_slots
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
        return await this.serviceDetailsRepository.findOne({
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
            .andWhere('user.role_id = :roleId', {roleId: Constants.ROLE_ORGANIZATION_ADMIN})
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

    async getOrgUsersDetails(organization_id: number) {
        return await this.userRepository.find({
            where: {
                organization: {id: organization_id},
                is_active: true,
                is_status: true
            },
            order: {created_at: "DESC"}
        })
    }

    async getServices(page_number: number, page_size: number, service_type: any,
                      state: number, city: string, zipcode: string, availability: string, structure: any,
                      staffing: number, substance: any, children: string, faith: any, living_arrangement: any,
                      guidelines: any, staff_diversity: any) {

        const structureMap = {
            1: 113,
            2: 112
        };
        const guidelinesMap = {
            1: 126,
            2: 127
        };
        const staffDiversityMap = {
            1: 120,
            2: 122,
            3: 121,
            4: 123,
            5: 124,
        };

        // Service type
        const baseWhere: any = {
            service_type,
        };
        let where: FindOptionsWhere<any>[] | FindOptionsWhere<any> = baseWhere;

        // City
        if (city) {
            baseWhere.city = city;
        }
        // State
        if (state) {
            baseWhere.state = state;
        }
        // Zipcode
        if (zipcode) {
            baseWhere.zipcode = zipcode;
        }
        // // Availability
        // if (availability === "true") {
        //     baseWhere.waitlist = false;
        // } else if (availability === "false") {
        //     baseWhere.waitlist = true;
        // }
        // // Structure
        // if (Array.isArray(structure) && structure.length > 0) {
        //     const mappedStructures = structure.map((val) => structureMap[val]).filter(Boolean);
        //     if (mappedStructures.length > 0) {
        //         baseWhere.service_structure = In(mappedStructures);
        //     }
        // }
        //
        // if (!structure) {
        //     baseWhere.service_structure = 111;
        // }
        //
        // // Staffing
        // if (Array.isArray(staffing) && staffing.length > 0) {
        //     baseWhere.staffing_level = In(staffing);
        // }
        //
        // // Substance
        // if (substance == 1) {
        //     where = [
        //         {...baseWhere, entry_requirement: Like('%93%')},
        //         {...baseWhere, entry_requirement: Like('%94%')}
        //     ];
        // }
        // if (substance == 3) {
        //     where = [
        //         {...baseWhere, entry_requirement: Like('%95%')},
        //     ];
        // }
        //
        // // Children
        // if (children === "true") {
        //     where = [
        //         {...baseWhere, served_to: Like('%17%')},
        //         {...baseWhere, served_to: Like('%18%')}
        //     ];
        // }
        //
        // // Faith
        // if (faith == 1) {
        //     where = [{
        //         ...baseWhere,
        //         faith_engagement: 110,
        //         service_model: Like('%99%')
        //     }];
        // }
        // if (faith == 2) {
        //     where = [{
        //         ...baseWhere,
        //         faith_engagement: 109,
        //         service_model: Like('%99%')
        //     }];
        // }
        // if (faith == 3) {
        //     baseWhere.service_model = Not(Like('%99%'));
        // }
        //
        // // Living Arrangement
        // if (Array.isArray(living_arrangement) && living_arrangement.length > 0) {
        //     baseWhere.staffing_level = In(living_arrangement);
        // }
        // // Guidelines
        // if (Array.isArray(guidelines) && guidelines.length > 0) {
        //     const mappedGuidelines = guidelines.map((val) => guidelinesMap[val]).filter(Boolean);
        //     if (mappedGuidelines.length > 0) {
        //         const guidelineConditions = mappedGuidelines.map(id => ({
        //             ...baseWhere,
        //             service_guidelines: Like(`%${id}%`)
        //         }));
        //         where = guidelineConditions;
        //     }
        // }
        // // Staff Diversity
        // if (Array.isArray(staff_diversity) && staff_diversity.length > 0) {
        //     const mappedStaffDiversity = staff_diversity.map((val) => staffDiversityMap[val]).filter(Boolean);
        //     if (mappedStaffDiversity.length > 0) {
        //         const staffDiversityConditions = mappedStaffDiversity.map(id => ({
        //             ...baseWhere,
        //             teams_diversity: Like(`%${id}%`)
        //         }));
        //         where = staffDiversityConditions;
        //     }
        // }


        const [data, total] = await this.serviceDetailsRepository.findAndCount({
            where,
            skip: (page_number - 1) * page_size,
            take: page_size,
        });

        return {data, total};
    }

    async checkIfOrganization(organization_id: number) {
        return await this.organizationRepository.findOne({
            where: {
                id: organization_id,
            }
        })
    }

    async checkIfServiceExists(service_id: number) {
        return await this.serviceDetailsRepository.findOne({
            where: {
                id: service_id
            }
        })
    }

    async editServiceSettings(body: any) {
        const serviceSetting = await this.serviceDetailsRepository.findOne({
            where: {
                id: body.service_id
            }
        })
        console.log(serviceSetting)
        if (serviceSetting) {
            serviceSetting.slots_available = body.available_slots;
            serviceSetting.service_manager = body.service_manager;
            serviceSetting.contact_email = body.contact_email;
            serviceSetting.contact_phone = body.contact_phone;
            await this.serviceDetailsRepository.save(serviceSetting);
        } else {
            return false;
        }
        const existingReminders = await this.emailReminderRepository.find({
            where: {service: {id: body.service_id}},
        });

        const incoming = body.emailReminders || [];

        // Force all processedIds to be numbers
        const processedIds: number[] = [];

        for (const reminder of incoming) {
            if (reminder.id) {
                const reminderId = parseInt(reminder.id);

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
                    service: {id: body.service_id},
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
        return await this.serviceDetailsRepository.findOne({
            where: {
                id: service_id
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

    async getServiceRequests(user_id: number, page_number = 1, page_size = 10, status?: number) {
        const skip = (page_number - 1) * page_size;

        const where: any = {
            organization: {id: user_id},
        };

        if (typeof status === 'number' && status !== ClientStatus.All) {
            where.status = status;
        }

        const [data, total] = await this.assignedServiceRepository.findAndCount({
            where,
            relations: ["organization", "service", "service.state", "client_service", "user"],
            skip,
            take: page_size,
            order: {created_at: "DESC"}
        });

        return {data, total};
    }

    async reportUser(type: any, reported_user: number, reason: string, user_id: number, organization_id: number) {
        const report = await this.reportUserRepository.create({
            reported_user: {id: reported_user},
            reason: reason,
            reported_by: {id: user_id},
            organization: {id: organization_id},
            type
        });

        const reportedUser = await this.userRepository.findOne({
            where: {id: reported_user},
            select: ["id", "first_name", "last_name", "user_name"]
        });

        const emailContent = ReportUserEmail(reportedUser.user_name == null ? `${reportedUser.first_name} ${reportedUser.last_name}` : reportedUser.user_name, reason, "user");
        const mailOptions = {
            from: `"${process.env.MAIL_FROM_NAME}" <${process.env.MAIL_FROM_ADDRESS}>`,
            to: process.env.SUPER_ADMIN_MAIN,
            subject: "Email from Atlas free!",
            html: emailContent
        };
        await this.mailerService.sendEmail(mailOptions)
        return await this.reportUserRepository.save(report);
    }

    async getServiceRequestsById(client_id: number) {
        return await this.assignedServiceRepository.findOne({
            where: {
                client_service: {id: client_id}
            },
            relations: ["organization", "service", "service.state", "client_service", "user"],
        })
    }

    async checkIfOrganizationRoleUser(user_id: number, role: number) {
        return await this.userRepository.findOne({
            where: {
                id: user_id,
                role: {id: role},
            }
        })
    }

    async checkIfOrganizationUser(user_id: number, organization_id: number) {
        return await this.userRepository.findOne({
            where: {
                id: user_id,
                organization: {id: organization_id},
            }
        })
    }

    async checkIfClientCreatedByUser(client_id: number, user_id: number) {
        return await this.assignedServiceRepository.findOne({
            where: {
                client_service: {id: client_id},
                user: {id: user_id},
            }
        })
    }

    async checkIfOrganizationClient(user_id: number, id: number) {
        return await this.clientServiceRepository.findOne({
            where: {
                id,
                user: {id: user_id},
            }
        })
    }

    async checkIfOrganizationIsAvailable(organization_id: number) {
        return await this.userRepository.findOne({
            where: {
                organization: {id: organization_id},
            },
            relations: ["organization", "organization.affiliations"]
        })
    }

    async getOrganizationServices(organization_id: number) {
        return await this.serviceDetailsRepository.find({
            where: {
                organization: {id: organization_id},
                is_submitted: true
            },
            relations: ["organization"]
        })
    }

    async getUserByOrganization(organization_id: number, role: number) {
        const whereCondition: any = {
            organization: {id: organization_id}
        };

        if (role !== 0) {
            whereCondition.role = {id: role};
        }

        return await this.userRepository.find({
            where: whereCondition,
            order: {created_at: "DESC"}
        });
    }

    async getOrganizationServicesByUserId(service_manager_id: number) {
        return await this.serviceDetailsRepository.find({
            where: {
                service_manager: Raw(alias => `FIND_IN_SET(:service_manager_id, ${alias}) > 0`, {service_manager_id})
            },
            relations: [ "state"]
        });
    }

    async checkIfUserInService(service_manager_id: number, service_id: number) {
        return await this.serviceDetailsRepository.findOne({
            where: {
                id: service_id,
                service_manager: Raw(alias => `FIND_IN_SET(:service_manager_id, ${alias}) > 0`, {service_manager_id})
            },
            relations: ["state"]
        });
    }

    async getOrganizationClientsByUserId(user_id: number) {
        return await this.assignedServiceRepository.find({
            where: {
                user: {id: user_id},
            },
            relations: ["client_service"],
        })
    }

    async checkIfServiceInOrganization(organization_id: number, service_id: number) {
        return await this.serviceDetailsRepository.find({
            where: {
                id: service_id,
                organization: {id: organization_id},
            }
        })
    }

    async checkIfEmailIsRoleUser(email: string, user_id: number, organization_id: number, role: number) {
        return await this.userRepository.findOne({
            where: {
                email,
                role: {id: role},
                id: Not(user_id),
                organization: {id: organization_id}
            }
        })
    }

    async removeUserFromService(service_manager_id: number, service_id: number) {
        const serviceSetting = await this.serviceDetailsRepository.findOne({
            where: {
                id: service_id,
                service_manager: Raw(() => `FIND_IN_SET(:idStr, service_manager) > 0`, {
                    idStr: service_manager_id.toString(),
                }),
            },
            relations: ["state"],
        });

        if (!serviceSetting) {
            console.log("No matching serviceSetting found.");
            return;
        }

        console.log("Before removal:", serviceSetting.service_manager);

        // Remove the service_manager_id
        serviceSetting.service_manager = serviceSetting.service_manager.filter(
            id => id !== service_manager_id
        );

        // if (!serviceSetting.service_manager.includes(replace_id)) {
        //     serviceSetting.service_manager.push(replace_id);
        // }

        console.log("After replacement:", serviceSetting.service_manager);

        const settings = await this.serviceDetailsRepository.save(serviceSetting);
        console.log(`Removed service_manager_id ${service_manager_id} from serviceSetting ${serviceSetting.id}`);
        return settings;
    }

    async removeUserClient(client_id: number) {
        const client = await this.assignedServiceRepository.findOne({
            where: {
                client_service: {id: client_id}
            }
        });
        if (client) {
            const getClient = await this.clientServiceRepository.findOne({
                where: {
                    id: client_id
                }
            });
            if (getClient) {
                await this.assignedServiceRepository.delete(client.id);
                return await this.clientServiceRepository.delete(getClient.id);
            }
        }
        return true
    }

    async checkIfSlotAvailable(service_id: number, organization_id: number) {
        const checkIfWaitlist = await this.serviceDetailsRepository.findOne({
            where: {
                id: service_id,
                organization: {id: organization_id},
            }
        })
        if (checkIfWaitlist.waitlist == true) {
            const checkIfSlotsAvailable = await this.serviceDetailsRepository.findOne({
                where: {
                    id: service_id,
                }
            })
            if (checkIfSlotsAvailable) {
                if (checkIfSlotsAvailable.slots_available == checkIfWaitlist.slots_available) {
                    return false;
                } else {
                    return true;
                }
            }
        }
        return true
    }

    async checkIfServiceRequestExists(organization_id: number, service_request: number) {
        return await this.assignedServiceRepository.findOne({
            where: {
                organization: {id: organization_id},
                id: service_request
            },
            relations: ["organization", "service", "service.state", "client_service", "user"]
        })
    }

    async removeUserFromSettings(service_manager_id: number, assigned_user_id: number) {
        const serviceSettings = await this.serviceDetailsRepository.find({
            where: {
                service_manager: Raw(() => `FIND_IN_SET(:idStr, service_manager) > 0`, {
                    idStr: service_manager_id.toString(),
                }),
            },
            relations: ["state"],
        });

        if (!serviceSettings) {
            console.log("No matching serviceSetting found.");
            return;
        }
        for (const serviceSetting of serviceSettings) {
            console.log("Before removal:", serviceSetting.service_manager);

            // Remove the service_manager_id
            serviceSetting.service_manager = serviceSetting.service_manager.filter(
                id => id !== service_manager_id
            );

            if (!serviceSetting.service_manager.includes(assigned_user_id)) {
                serviceSetting.service_manager.push(assigned_user_id);
            }

            console.log("After replacement:", serviceSetting.service_manager);

            await this.serviceDetailsRepository.save(serviceSetting);
            console.log(`Removed service_manager_id ${service_manager_id} from serviceSetting ${serviceSetting.id}`);
        }
        return true
    }

    async removeUserServiceRequest(service_manager_id: number, assigned_user_id: any) {
        const assignedServices = await this.assignedServiceRepository.find({
            where: {
                user: {id: service_manager_id},
            },
            relations: ["user", "service", "service.state", "client_service"]
        });

        if (assignedServices) {
            for (const assignedService of assignedServices) {
                if (assignedService.user.id == service_manager_id) {
                    assignedService.user = assigned_user_id
                    await this.assignedServiceRepository.save(assignedService);
                }
            }
            return true;
        }
    }

    async removeUserClients(service_manager_id: number, assigned_user_id: any) {
        const clients = await this.clientServiceRepository.find({
            where: {
                user: {id: service_manager_id},
            },
            relations: ["user"]
        });
        if (clients) {
            for (const client of clients) {
                if (client.user.id == service_manager_id) {
                    client.user = assigned_user_id;
                    await this.clientServiceRepository.save(client);
                }
            }
        }
        return true
    }

    async removeServiceDetails(service_manager_id: number, assigned_user_id: any) {
        const service_details = await this.serviceDetailsRepository.find({
            where: {
                user: {id: service_manager_id},
            },
            relations: ["user"]
        });

        if (service_details) {
            for (const service_detail of service_details) {
                if (service_detail.user.id == service_manager_id) {
                    service_detail.user = assigned_user_id;
                    await this.serviceDetailsRepository.save(service_detail);
                }
            }
        }
        return true
    }

    async removeReportedUser(user_id: number, admin_id: number) {
        const reportedByUsers = await this.reportUserRepository.find({
            where: {
                reported_by: {id: user_id}
            },
            relations: ['reported_by']
        });
        if (reportedByUsers) {
            for (const reportedByUser of reportedByUsers) {
                if (reportedByUser.reported_by.id == user_id) {
                    reportedByUser.reported_by.id = admin_id;
                    await this.reportUserRepository.save(reportedByUser);
                }
            }
        }

        const reportedUsers = await this.reportUserRepository.find({
            where: {
                reported_user: {id: user_id}
            },
            relations: ['reported_user']
        });
        if (reportedUsers) {
            for (const reportedUser of reportedUsers) {
                if (reportedUser.reported_user.id == user_id) {
                    await this.reportUserRepository.delete(reportedUser.id);
                }
            }
        }

        return true;
    }

    async removeReportedService(user_id: number, admin_id: number) {
        const reportedByServices = await this.reportServiceRepository.find({
            where: {
                user: {id: user_id}
            },
            relations: ['user']
        });
        if (reportedByServices) {
            for (const reportedByService of reportedByServices) {
                if (reportedByService.user.id == user_id) {
                    reportedByService.user.id = admin_id;
                    await this.reportServiceRepository.save(reportedByService);
                }
            }
        }
        return true
    }

    async removeAssignedService(service_id: number) {
        const assignedServices = await this.assignedServiceRepository.find({
            where: {
                service: {id: service_id}
            },
            relations: ["service"]
        });

        if (assignedServices) {
            for (const assignedService of assignedServices) {
                if (assignedService.service.id == service_id) {
                    await this.assignedServiceRepository.delete(assignedService.id);
                }
            }
        }
        return true;
    }

    async removeServiceSettings(service_id: number) {
        const emailReminders = await this.emailReminderRepository.find({
            where: {
                service: {id: service_id}
            }
        });
        console.log("emailReminders: ", emailReminders)
        if (emailReminders) {
            for (const emailReminder of emailReminders) {
                await this.emailReminderRepository.delete(emailReminder.id);
            }
        }
        return true;
    }

    async removeService(service_id: number) {
        const service = await this.serviceDetailsRepository.findOne({
            where: {
                id: service_id,
            }
        });

        if (service) {
            await this.serviceDetailsRepository.delete(service.id);
            return true;
        }
        return false;
    }

    async getClientsByOrganization(organization_id: number) {
        return await this.clientServiceRepository.find({
            where: {
                organization: {id: organization_id},
            },
            order: {created_at: "DESC"}
        })
    }

    async checkIfOrganizationClientExists(organization_id: number, client_id: number) {
        return await this.clientServiceRepository.findOne({
            where: {
                id: client_id,
                organization: {id: organization_id},
            }
        })
    }

}
