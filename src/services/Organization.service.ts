import AppDataSource from "../../ormconfig";
import {Users} from "../entity/Users.entity";
import {Constants, roleTypeMap} from "../helper/Constants.helper";
import {randomBytes} from "crypto";
import {PasswordReset} from "../entity/PasswordReset.entity";
import {
    ActivateOrganization,
    CreatePassword,
    PasswordResetEmail, PendingOrganization, RejectOrganization, ReportedUser, ReportUserEmail,
    SendInvitationEmail, SurvivorReportReceipt,
    VerifyEmail
} from "../helper/Emails.helper";
import {type} from "node:os";
import {EmailService} from "./Email.service";
import {
    Brackets,
    Equal,
    FindOptionsWhere,
    In,
    IsNull,
    LessThanOrEqual,
    Like,
    MoreThan,
    MoreThanOrEqual,
    Not,
    Raw
} from "typeorm";
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
    private affiliationRepository = AppDataSource.getRepository(Affiliations);
    private mailerService = new EmailService();

    async getOrganizations(filter: string, search?: string, state?: any) {
        if (filter === "active") {
            const query = this.userRepository
                .createQueryBuilder('user')
                .leftJoinAndSelect('user.organization', 'organization')
                .leftJoinAndSelect('organization.affiliations', 'affiliations')
                .leftJoinAndSelect('affiliations.affiliation', 'registrationOption')
                .leftJoinAndSelect('organization.state', 'state')
                .leftJoinAndSelect('organization.default_user', 'default_user')
                .andWhere('user.role_id = :roleId', {roleId: Constants.ROLE_ORGANIZATION_ADMIN})
                .andWhere('organization.is_active = :orgActive', {orgActive: true})
                .andWhere('organization.under_review = :underReview', {underReview: false});

            if (search && search.trim() !== "") {
                query.andWhere(
                    'LOWER(organization.name) LIKE LOWER(:search)',
                    {search: `%${search}%`}
                );
            }

            if (state?.length) {
                console.log(
                    "State active:", state
                )
                query.andWhere("organization.state_id IN (:...stateIds)", {
                    stateIds: state,
                });
            }

            const users = await query
                .orderBy('user.created_at', 'DESC')
                .getMany();

            const seen = new Set<number>();
            return users.filter(user => {
                if (!user.organization || seen.has(user.organization.id)) return false;
                seen.add(user.organization.id);
                return true;
            });

        }
        if (filter === "inactive") {
            const query = this.userRepository
                .createQueryBuilder('user')
                .leftJoinAndSelect('user.organization', 'organization')
                .leftJoinAndSelect('organization.affiliations', 'affiliations')
                .leftJoinAndSelect('affiliations.affiliation', 'registrationOption')
                .leftJoinAndSelect('organization.state', 'state')
                .leftJoinAndSelect('organization.default_user', 'default_user')
                .andWhere('user.role_id = :roleId', {roleId: Constants.ROLE_ORGANIZATION_ADMIN})
                .andWhere('organization.is_active = :orgActive', {orgActive: false})
                .andWhere('organization.under_review = :underReview', {underReview: false})
                .orderBy('user.created_at', 'DESC');
            // .andWhere('user.is_active = :userActive', {userActive: true})
            if (state?.length) {
                console.log(
                    "State inactive:", state
                )
                query.andWhere("organization.state_id IN (:...stateIds)", {
                    stateIds: state,
                });
            }
            const users = await query.getMany();

            const seen = new Set<number>();
            return users.filter(user => {
                if (!user.organization || seen.has(user.organization.id)) return false;
                seen.add(user.organization.id);
                return true;
            });
        }
        if (filter === "pending") {
            const query = this.userRepository
                .createQueryBuilder('user')
                .leftJoinAndSelect('user.organization', 'organization')
                .leftJoinAndSelect('organization.affiliations', 'affiliations')
                .leftJoinAndSelect('affiliations.affiliation', 'registrationOption')
                .leftJoinAndSelect('organization.state', 'state')
                .leftJoinAndSelect('organization.default_user', 'default_user')
                .andWhere('user.role_id = :roleId', {roleId: Constants.ROLE_ORGANIZATION_ADMIN})
                .andWhere('organization.is_active = :orgActive', {orgActive: true})
                .andWhere('organization.under_review = :underReview', {underReview: true})
                .orderBy('user.created_at', 'DESC')
            // .andWhere('user.is_active = :userActive', {userActive: true})
            if (state?.length) {
                console.log(
                    "State pending:", state
                )
                query.andWhere("organization.state_id IN (:...stateIds)", {
                    stateIds: state,
                });
            }
            const users = await query.getMany();

            const seen = new Set<number>();
            return users.filter(user => {
                if (!user.organization || seen.has(user.organization.id)) return false;
                seen.add(user.organization.id);
                return true;
            });
        }
    }

    async updateStatus(organization_id: number, status_id: number) {
        const organization = await this.userRepository.findOne({
            where: {
                organization: {id: organization_id},
                role: {id: Constants.ROLE_ORGANIZATION_ADMIN}
            },
            relations: ['organization']
        })
        const getAffiliations = await this.affiliationRepository.find({
            where: {
                organization: {id: organization_id},
                is_active: false
            }
        })
        if (organization) {
            if (status_id == 0) {
                const token = randomBytes(32).toString('hex');
                organization.organization.is_active = true
                organization.organization.under_review = true
                await this.organizationRepository.save(organization.organization);
                const emailContent = PendingOrganization(organization.user_name, organization.organization.name, organization.email, token, Constants.CREATE_PASSWORD, organization.role.id);
                const mailOptions = {
                    from: `"${process.env.MAIL_FROM_NAME}" <${process.env.MAIL_FROM_ADDRESS}>`,
                    to: organization.email,
                    subject: `Unable to accept ${organization.organization.name}'s profile changes`,
                    html: emailContent
                };
                await this.mailerService.sendEmail(mailOptions);
                return organization.organization;
            }
            if (status_id == 2) {
                const token = randomBytes(32).toString('hex');
                organization.organization.is_active = false
                organization.organization.under_review = false
                await this.organizationRepository.save(organization.organization);
                const emailContent = RejectOrganization(organization.user_name, organization.organization.name, organization.email, token, Constants.CREATE_PASSWORD, organization.role.id);
                const mailOptions = {
                    from: `"${process.env.MAIL_FROM_NAME}" <${process.env.MAIL_FROM_ADDRESS}>`,
                    to: organization.email,
                    subject: `${organization.organization.name} could not be verified in Wayplace`,
                    html: emailContent
                };
                await this.mailerService.sendEmail(mailOptions);
                return organization.organization;
            }
            if (status_id == 1) {
                organization.organization.is_active = true
                organization.organization.under_review = false
                const token = randomBytes(32).toString('hex');
                if (organization.emailVerifiedAt === null) {
                    if (getAffiliations) {
                        for (const affiliation of getAffiliations) {
                            affiliation.is_active = true
                            await this.affiliationRepository.save(affiliation)
                        }
                    }
                    const password_reset_request = this.passwordResetRepository.create({
                        email: organization.email,
                        token,
                        type: Constants.CREATE_PASSWORD,
                        user: {id: organization.id}
                    })
                    await this.passwordResetRepository.save(password_reset_request);
                    const emailContent = CreatePassword(organization.organization.name, organization.email, token, Constants.CREATE_PASSWORD, organization.role.id);
                    const mailOptions = {
                        from: `"${process.env.MAIL_FROM_NAME}" <${process.env.MAIL_FROM_ADDRESS}>`,
                        to: organization.email,
                        subject: `${organization.organization.name} has been verified in Wayplace`,
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
                    if (getAffiliations) {
                        for (const affiliation of getAffiliations) {
                            console.log("Affiliation id: ", affiliation.affiliation.id)
                            const getAffiliation = await this.affiliationRepository.findOne({
                                where: {
                                    affiliation: {id: affiliation.affiliation.id},
                                    is_active: true,
                                }
                            })
                            console.log("getAffiliation: ", getAffiliation)
                            if (getAffiliation) {
                                await this.affiliationRepository.delete(getAffiliation.id)
                            }
                            affiliation.is_active = true
                            await this.affiliationRepository.save(affiliation)
                        }
                    }
                    const emailContent = ActivateOrganization(organization.user_name || organization.first_name, organization.email, token, Constants.ACTIVATE_ORGANIZATION);
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

    async addServiceDetails(organization_id: number, role: number, body: any, user_id?: number, checkIfValidOrganization?: Organization) {
        const isOrgAddress = body.is_organization_address === true || body.is_organization_address === 'true';
        if (!isOrgAddress) {
            if (body.state == 0 || body.state == null)
                throw new Error("Please enter your service state")
        }
        console.log("Body: ", body);
        const addService = await this.serviceDetailsRepository.create({
            organization: {id: organization_id},
            name: body.name,
            street: isOrgAddress ? checkIfValidOrganization.street : body.street,
            address: isOrgAddress ? checkIfValidOrganization.address : body.address,
            state: isOrgAddress ? checkIfValidOrganization.state : body.state,
            city: isOrgAddress ? checkIfValidOrganization.city : body.city,
            zipcode: isOrgAddress ? checkIfValidOrganization.zipcode : body.zipcode,
            disclose_address: isOrgAddress
                ? false
                : (body.disclose_address === true || body.disclose_address === 'true'),
            is_organization_address: body.is_organization_address === true || body.is_organization_address === 'true',
            service_type: body.service_type || null,
            total_available_slots: body.total_available_slots || null,
            slots_available: body.slots_available || body.total_available_slots,
            slots_beds: body.slots_beds,
            start_day_of_service: body.start_day_of_service,
            service_limited: body.service_limited === true || body.service_limited === 'true',
            enrollment_type: body.enrollment_type || null,
            enrollment_period: body.enrollment_period || null,
            extension: body.extension === true || body.extension === 'true',
            waitlist: body.waitlist === true || body.waitlist === 'true',
            service_description: body.service_description,

            minimum_age: body.minimum_age || null,
            maximum_age: body.maximum_age || null,
            genders_served: body.genders_served || null,
            served_to: body.served_to || null,
            minimum_children_age: body.minimum_children_age || null,
            maximum_children_age: body.maximum_children_age || null,
            maximum_children_intake: body.maximum_children_intake || null,
            citizenship_requirement: body.citizenship_requirement || null,
            language_requirement: body.language_requirement || null,
            out_of_state_relocation: body.out_of_state_relocation === true || body.out_of_state_relocation === 'true',

            trafficking_status: body.trafficking_status || null,
            legal: body.legal || null,
            health_needs: body.health_needs || null,
            medications: body.medications || null,
            mental_health_diagnoses: body.mental_health_diagnoses || null,
            physical_accommodations: body.physical_accommodations || null,
            medication_others: body.medication_others || null,
            mental_health_diagnoses_others: body.mental_health_diagnoses_others || null,
            physical_accommodation_others: body.physical_accommodation_others || null,
            smoking_allowed: body.smoking_allowed || null,
            entry_requirement: body.entry_requirement || null,
            days_sober: body.days_sober,

            service_model: body.service_model || null,
            faith_engagement: body.faith_engagement || null,
            faith_engagement_practice: body.faith_engagement_practice,
            service_structure: body.service_structure || null,
            sleeping_arrangement: body.sleeping_arrangement || null,
            staffing_level: body.staffing_level || null,
            teams_diversity: body.teams_diversity || null,
            service_guidelines: body.service_guidelines || null,

            support_provided: body.support_provided || null,
            support_offered: body.support_offered || null,
            intake_process: body.intake_process,
            additional_requirements: body.additional_requirements,
            reason_for_removal: body.reason_for_removal,
            is_submitted: body.is_submitted === true || body.is_submitted === 'true',
            role: {id: role},
            user: {id: user_id}
        })
        return await this.serviceDetailsRepository.save(addService)
    }

    async editServiceDetails(id: number, organization_id: number, role: number, body: any, user_id?: number, checkIfValidOrganization?: any) {
        const getService = await this.serviceDetailsRepository.findOne({
            where: {
                id: id,
                organization: {id: organization_id},
            }
        })
        // console.log("Body: ", body);
        // console.log("checkIfValidOrganization: ", checkIfValidOrganization)
        // console.log("org address state: ", checkIfValidOrganization?.state?.id)
        if (getService) {
            const isOrgAddress = body.is_organization_address === true || body.is_organization_address === 'true';
            if (!isOrgAddress) {
                if (body.state == 0 || body.state == null)
                    throw new Error("Please enter your service state")
            }
            // console.log("isOrgAddress: ", isOrgAddress)
            getService.name = body.name
            getService.street = isOrgAddress
                ? checkIfValidOrganization?.street
                : body.street;

            getService.address = isOrgAddress
                ? checkIfValidOrganization?.address
                : body.address;

            getService.city = isOrgAddress
                ? checkIfValidOrganization?.city
                : body.city;

            getService.state = isOrgAddress
                ? checkIfValidOrganization?.state
                : body.state;

            getService.zipcode = isOrgAddress
                ? checkIfValidOrganization?.zipcode
                : body.zipcode;
            if (isOrgAddress) {
                getService.disclose_address = false;
            } else {
                getService.disclose_address = body.disclose_address === true || body.disclose_address === 'true';
            }
            getService.is_organization_address = body.is_organization_address === true || body.is_organization_address === 'true';
            getService.service_type = body.service_type || null
            getService.total_available_slots = body.total_available_slots || null
            getService.slots_beds = body.slots_beds || null
            getService.start_day_of_service = body.start_day_of_service
            getService.service_limited = body.service_limited === true || body.service_limited === 'true';
            getService.enrollment_type = body.enrollment_type || null
            getService.enrollment_period = body.enrollment_period || null
            getService.extension = body.extension === true || body.extension === 'true';
            getService.waitlist = body.waitlist === true || body.waitlist === 'true';
            getService.service_description = body.service_description

            getService.minimum_age = body.minimum_age || null
            getService.maximum_age = body.maximum_age || null
            getService.genders_served = body.genders_served || null
            getService.served_to = body.served_to || null
            getService.minimum_children_age = body.minimum_children_age || null
            getService.maximum_children_age = body.maximum_children_age || null
            getService.maximum_children_intake = body.maximum_children_intake || null
            getService.citizenship_requirement = body.citizenship_requirement || null
            getService.language_requirement = body.language_requirement || null
            getService.out_of_state_relocation = body.out_of_state_relocation === true || body.out_of_state_relocation === 'true'

            getService.trafficking_status = body.trafficking_status || null
            getService.legal = body.legal || null
            getService.health_needs = body.health_needs || null
            getService.medications = body.medications || null
            getService.mental_health_diagnoses = body.mental_health_diagnoses || null
            getService.physical_accommodations = body.physical_accommodations || null
            getService.medication_others = body.medication_others || null,
                getService.mental_health_diagnoses_others = body.mental_health_diagnoses_others || null,
                getService.physical_accommodation_others = body.physical_accommodation_others || null,
                getService.smoking_allowed = body.smoking_allowed || null
            getService.entry_requirement = body.entry_requirement || null
            getService.days_sober = body.days_sober

            getService.service_model = body.service_model || null
            getService.faith_engagement = body.faith_engagement || null
            getService.faith_engagement_practice = body.faith_engagement_practice
            getService.service_structure = body.service_structure || null
            getService.sleeping_arrangement = body.sleeping_arrangement || null
            getService.staffing_level = body.staffing_level || null
            getService.teams_diversity = body.teams_diversity || null
            getService.service_guidelines = body.service_guidelines || null

            getService.support_provided = body.support_provided || null
            getService.support_offered = body.support_offered || null
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
            },
            relations: ["organization.state"]
        })
    }

    async getOrganizationsService(organization: number) {
        return await this.serviceDetailsRepository
            .createQueryBuilder('service')
            .leftJoinAndSelect('service.organization', 'organization')
            .leftJoinAndSelect('service.state', 'state')
            .leftJoinAndSelect(
                'organization.users',
                'orgAdmin',
                'orgAdmin.role_id = :roleId',
                {roleId: Constants.ROLE_ORGANIZATION_ADMIN}
            )
            .where('service.organization_id = :organization', {organization})
            .getMany();
    }

    async getOrganizationsServiceById(id: number) {
        return await this.serviceDetailsRepository
            .createQueryBuilder('service')
            .leftJoinAndSelect('service.organization', 'organization')
            .leftJoinAndSelect('service.state', 'state')
            .leftJoinAndSelect(
                'organization.users',
                'orgAdmin',
                'orgAdmin.role_id = :roleId',
                {roleId: Constants.ROLE_ORGANIZATION_ADMIN}
            )
            .where('service.id = :id', {id})
            .getOne();
    }

    async getOrganizationsById(id: number) {
        return await this.userRepository
            .createQueryBuilder('user')
            .leftJoinAndSelect('user.organization', 'organization')
            .leftJoinAndSelect('organization.state', 'state') // ✅ include state relation
            .leftJoinAndSelect('organization.affiliations', 'affiliations')
            .leftJoinAndSelect('affiliations.affiliation', 'registrationOption')
            .leftJoinAndSelect('organization.default_user', 'default_user')
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
            const formattedRole = formatRoleName(roleTypeMap[role])
            const emailContent = SendInvitationEmail(email, token, Constants.SEND_INVITATION, role, organization_name, formattedRole);
            const mailOptions = {
                from: `"${process.env.MAIL_FROM_NAME}" <${process.env.MAIL_FROM_ADDRESS}>`,
                to: email,
                subject: "You are invited to join Wayplace",
                html: emailContent
            };
            await this.mailerService.sendEmail(mailOptions);
        }
        return invitation
    }

    async resendInvitation(user_id: number, email: string, role: number, organization_id: number, organization_name: string) {
        await this.passwordResetRepository.update(
            {user: {id: user_id}, type: In([Constants.SEND_INVITATION, Constants.RESEND_INVITATION]), active: true},
            {active: false}
        );

        const token = randomBytes(32).toString('hex');
        const password_reset_request = this.passwordResetRepository.create({
            email: email,
            token,
            type: Constants.RESEND_INVITATION,
            user: {id: user_id}
        })
        const password_resets = await this.passwordResetRepository.save(password_reset_request)
        if (password_resets) {
            const emailContent = SendInvitationEmail(email, token, Constants.RESEND_INVITATION, role, organization_name, roleTypeMap[role].replace("_", " "));
            const mailOptions = {
                from: `"${process.env.MAIL_FROM_NAME}" <${process.env.MAIL_FROM_ADDRESS}>`,
                to: email,
                subject: "You are invited to join Wayplace",
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
                // is_active: true,
                is_status: true,
                // emailVerifiedAt: Not(IsNull()),
            },
            order: {created_at: "DESC"}
        })
    }

    async getOrgAdminUsers(organization_id: number, role: number) {
        return await this.userRepository.find({
            where: {
                organization: {id: organization_id},
                is_active: true,
                is_status: true,
                emailVerifiedAt: Not(IsNull()),
                role: {
                    id: role
                }
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
                      staffing: any, substance: any, children: string, faith: any, living_arrangement: any,
                      guidelines: any, staff_diversity: any,
                      age: number | null = null, gender: number[] = [], pregnant: string = null,
                      children_accompany: string = null, language: number | null = null,
                      medications: number[] = [], mental_health: number[] = [],
                      physical_accommodations_filter: number[] = []) {

        const structureMap = {
            1: [113],
            2: [112, 111]
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

        const qb = this.serviceDetailsRepository
            .createQueryBuilder('svc')
            .leftJoinAndSelect('svc.organization', 'org')
            .leftJoinAndSelect('svc.state', 'svcState')
            .leftJoinAndSelect('org.state', 'orgState');

        // Baseline filters
        qb.andWhere('svc.is_submitted = :submitted', {submitted: true})
            .andWhere('org.is_active = :isActive', {isActive: true})
            .andWhere('org.under_review = :underReview', {underReview: false});

        // Service type
        if (Array.isArray(service_type) && service_type.length > 0) {
            qb.andWhere('svc.service_type IN (:...serviceTypes)', {serviceTypes: service_type.map(Number)});
        } else if (service_type) {
            qb.andWhere('svc.service_type = :serviceType', {serviceType: Number(service_type)});
        }

        // State — use org state when is_organization_address = true
        if (state) {
            qb.andWhere(new Brackets(qb2 => {
                qb2.where('(svc.is_organization_address = false AND svcState.id = :stateId)', {stateId: state})
                    .orWhere('(svc.is_organization_address = true AND orgState.id = :stateId)', {stateId: state});
            }));
        }

        // City — use org city when is_organization_address = true
        if (city) {
            qb.andWhere(new Brackets(qb2 => {
                qb2.where('(svc.is_organization_address = false AND svc.city = :city)', {city})
                    .orWhere('(svc.is_organization_address = true AND org.city = :city)', {city});
            }));
        }

        // Zipcode — use org zipcode when is_organization_address = true
        if (zipcode) {
            qb.andWhere(new Brackets(qb2 => {
                qb2.where('(svc.is_organization_address = false AND svc.zipcode = :zipcode)', {zipcode})
                    .orWhere('(svc.is_organization_address = true AND org.zipcode = :zipcode)', {zipcode});
            }));
        }

        // Availability
        if (availability === "true" || availability === "1") {
            qb.andWhere('svc.slots_available > :minSlots', {minSlots: 0});
        }

        // Structure
        if (Array.isArray(structure) && structure.length > 0) {
            const mappedStructures = structure
                .flatMap((val) => structureMap[val] || [])
                .filter(Boolean);
            if (mappedStructures.length > 0) {
                qb.andWhere('svc.service_structure IN (:...structures)', {structures: mappedStructures});
            }
        }

        // Staffing
        if (Array.isArray(staffing) && staffing.length > 0) {
            console.log("Staffing", staffing)
            qb.andWhere('svc.staffing_level IN (:...staffingLevels)', {staffingLevels: staffing});
        }

        // Substance
        if (substance == 1) {
            qb.andWhere(new Brackets(qb2 => {
                qb2.where('svc.entry_requirement LIKE :s1a', {s1a: '%93%'})
                    .orWhere('svc.entry_requirement LIKE :s1b', {s1b: '%94%'});
            }));
        } else if (substance == 2) {
            qb.andWhere('svc.entry_requirement LIKE :s2', {s2: '%95%'});
        }

        // Children
        if (children === "true" || children === "1") {
            qb.andWhere(new Brackets(qb2 => {
                qb2.where('svc.served_to LIKE :ch1', {ch1: '%17%'})
                    .orWhere('svc.served_to LIKE :ch2', {ch2: '%18%'});
            }));
        }

        // Faith
        if (faith == 1) {
            qb.andWhere('svc.faith_engagement = :fe1', {fe1: 110})
                .andWhere('svc.service_model LIKE :fm1', {fm1: '%99%'});
        } else if (faith == 2) {
            qb.andWhere('svc.faith_engagement IN (:...fe2)', {fe2: [107, 108, 109]})
                .andWhere('svc.service_model LIKE :fm2', {fm2: '%99%'});
        } else if (faith == 3) {
            qb.andWhere('svc.service_model NOT LIKE :fm3', {fm3: '%99%'});
        }

        // Living arrangement
        if (Array.isArray(living_arrangement) && living_arrangement.length > 0) {
            qb.andWhere('svc.sleeping_arrangement IN (:...livingArr)', {livingArr: living_arrangement});
        }

        // Guidelines (OR across matched IDs)
        if (Array.isArray(guidelines) && guidelines.length > 0) {
            const mappedGl = guidelines.map((val) => guidelinesMap[val]).filter(Boolean);
            if (mappedGl.length > 0) {
                qb.andWhere(new Brackets(qb2 => {
                    mappedGl.forEach((id, i) => {
                        const p = `gl${i}`;
                        i === 0
                            ? qb2.where(`svc.service_guidelines LIKE :${p}`, {[p]: `%${id}%`})
                            : qb2.orWhere(`svc.service_guidelines LIKE :${p}`, {[p]: `%${id}%`});
                    });
                }));
            }
        }

        // Staff diversity (OR across matched IDs)
        if (Array.isArray(staff_diversity) && staff_diversity.length > 0) {
            const mappedSd = staff_diversity.map((val) => staffDiversityMap[val]).filter(Boolean);
            if (mappedSd.length > 0) {
                qb.andWhere(new Brackets(qb2 => {
                    mappedSd.forEach((id, i) => {
                        const p = `sdiv${i}`;
                        i === 0
                            ? qb2.where(`svc.teams_diversity LIKE :${p}`, {[p]: `%${id}%`})
                            : qb2.orWhere(`svc.teams_diversity LIKE :${p}`, {[p]: `%${id}%`});
                    });
                }));
            }
        }

        // Pre-filter: Age
        if (age !== null) {
            qb.andWhere('(svc.minimum_age IS NULL OR svc.minimum_age <= :age)', {age})
                .andWhere('(svc.maximum_age IS NULL OR svc.maximum_age >= :age)');
        }
        //
        // // Pre-filter: Gender (at least one match)
        if (gender.length > 0) {
            qb.andWhere(new Brackets(qb2 => {
                gender.forEach((gId, i) => {
                    const p = `gend${i}`;
                    i === 0
                        ? qb2.where(`svc.genders_served LIKE :${p}`, {[p]: `%${gId}%`})
                        : qb2.orWhere(`svc.genders_served LIKE :${p}`, {[p]: `%${gId}%`});
                });
            }));
        }
        //
        // // Pre-filter: Pregnancy — only restrict if user is pregnant
        if (pregnant === "true" || pregnant === "1") {
            qb.andWhere('svc.served_to LIKE :pregId', {pregId: '%17%'});
        }
        //
        // // Pre-filter: Children — only restrict if user must bring children
        if (children_accompany === "1" || children_accompany == "true") {
            qb.andWhere(new Brackets(qb2 => {
                qb2.where('svc.served_to LIKE :par1', {par1: '%18%'})
                    .orWhere('svc.served_to LIKE :par2', {par2: '%20%'});
            }));
        }
        //
        // // Pre-filter: Language (speaking ability 1=Fluent→24, 2=Limited→25, 3=None→26)
        const langMap: Record<number, number> = {1: 24, 2: 25, 3: 26};
        if (language !== null && langMap[language]) {
            // console.log(langMap[language]);
            qb.andWhere('svc.language_requirement LIKE :langId', {langId: `%${langMap[language]}%`});
        }
        //
        // // Pre-filter: Medications (ignore "Not taking any"=55, "Other"=67)
        const IGNORE_MEDS = [55, 67];
        const filteredMeds = medications.filter(id => !IGNORE_MEDS.includes(id));
        if (filteredMeds.length > 0) {
            qb.andWhere(new Brackets(qb2 => {
                filteredMeds.forEach((mId, i) => {
                    const p = `med${i}`;
                    i === 0
                        ? qb2.where(`svc.medications LIKE :${p}`, {[p]: `%${mId}%`})
                        : qb2.orWhere(`svc.medications LIKE :${p}`, {[p]: `%${mId}%`});
                });
            }));
        }
        //
        // // Pre-filter: Mental Health (ignore "None"=78, "Other"=79)
        const IGNORE_MH = [78, 79];
        const filteredMH = mental_health.filter(id => !IGNORE_MH.includes(id));
        if (filteredMH.length > 0) {
            qb.andWhere(new Brackets(qb2 => {
                filteredMH.forEach((mhId, i) => {
                    const p = `mh${i}`;
                    i === 0
                        ? qb2.where(`svc.mental_health_diagnoses LIKE :${p}`, { [p]: `%${mhId}%` })
                        : qb2.orWhere(`svc.mental_health_diagnoses LIKE :${p}`, { [p]: `%${mhId}%` });
                });
            }));
        }
        //
        // // Pre-filter: Physical Accommodations (ignore "None"=87, "Other"=171)
        const IGNORE_PA = [87, 171];
        const filteredPA = physical_accommodations_filter.filter(id => !IGNORE_PA.includes(id));
        if (filteredPA.length > 0) {
            qb.andWhere(new Brackets(qb2 => {
                filteredPA.forEach((paId, i) => {
                    const p = `pa${i}`;
                    i === 0
                        ? qb2.where(`svc.physical_accommodations LIKE :${p}`, { [p]: `%${paId}%` })
                        : qb2.orWhere(`svc.physical_accommodations LIKE :${p}`, { [p]: `%${paId}%` });
                });
            }));
        }

        const [data, total] = await qb
            .skip((page_number - 1) * page_size)
            .take(page_size)
            .getManyAndCount();

        return {data, total};
    }

    async checkIfOrganization(organization_id: number) {
        return await this.organizationRepository.findOne({
            where: {
                id: organization_id,
            },
            relations: ['state'],
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
        console.log("Service manager: ", service_managers)
        if (!service_managers) return [];

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

    async reportAdvocate(type: any, reported_user: number, reason: string, user_id: number, organization_id?: number) {
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

        console.log("reportedUser: ", reportedUser);

        const emailContent = ReportUserEmail(reportedUser.user_name == null ? `${reportedUser.first_name} ${reportedUser.last_name}` : reportedUser.user_name, reason, "user");
        const mailOptions = {
            from: `"${process.env.MAIL_FROM_NAME}" <${process.env.MAIL_FROM_ADDRESS}>`,
            to: process.env.SUPER_ADMIN_MAIN,
            subject: "Email from Atlas free!",
            html: emailContent
        };
        await this.mailerService.sendEmail(mailOptions)
        const user = await this.userRepository.findOne({
            where: {
                id: user_id
            }
        })
        // console.log("User advocate: ", user)
        if (user) {
            const emailReportContent = ReportedUser()
            const mailOptions = {
                from: `"${process.env.MAIL_FROM_NAME}" <${process.env.MAIL_FROM_ADDRESS}>`,
                to: user.email,
                subject: "You have reported a user in Wayplace",
                html: emailReportContent
            };
            await this.mailerService.sendEmail(mailOptions)
        }
        return await this.reportUserRepository.save(report);
    }

    async reportUser(type: any, reason: string, user_id: number, organization_id?: number, client_service_id?: number) {
        const report = await this.reportUserRepository.create({
            reported_client: {id: client_service_id},
            reason: reason,
            reported_by: {id: user_id},
            organization: {id: organization_id},
            type
        });
        const reportedUser = await this.clientServiceRepository.findOne({
            where: {id: client_service_id},
        });

        const emailContent = ReportUserEmail(reportedUser.client_nick_name, reason, "user");
        const mailOptions = {
            from: `"${process.env.MAIL_FROM_NAME}" <${process.env.MAIL_FROM_ADDRESS}>`,
            to: process.env.SUPER_ADMIN_MAIN,
            subject: "Email from Atlas free!",
            html: emailContent
        };
        await this.mailerService.sendEmail(mailOptions)
        const user = await this.userRepository.findOne({
            where: {
                id: user_id
            }
        })
        // console.log("User user: ", user)
        if (user) {
            const emailReportContent = ReportedUser()
            const mailOptions = {
                from: `"${process.env.MAIL_FROM_NAME}" <${process.env.MAIL_FROM_ADDRESS}>`,
                to: user.email,
                subject: "You have reported a user in Wayplace",
                html: emailReportContent
            };
            await this.mailerService.sendEmail(mailOptions)
        }
        return await this.reportUserRepository.save(report);
    }

    async getServiceRequestsById(client_id: number) {
        return await this.assignedServiceRepository.find({
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
            },
            relations: ["user", "organization"]
        })
    }

    async checkIfOrganizationIsAvailable(organization_id: number) {
        return await this.userRepository.findOne({
            where: {
                organization: {id: organization_id},
            },
            relations: ["organization", "organization.affiliations", "organization.state", "organization.default_user"]
        })
    }

    async getOrganizationServices(organization_id: number) {
        return await this.serviceDetailsRepository.find({
            where: {
                organization: {id: organization_id},
                is_submitted: true
            },
            relations: ["organization", "state"]
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
            order: {created_at: "DESC"},
            // relations: ["roles"]
        });
    }

    async getOrganizationServicesByUserId(service_manager_id: number) {
        return await this.serviceDetailsRepository.find({
            where: {
                service_manager: Raw(alias => `FIND_IN_SET(:service_manager_id, ${alias}) > 0`, {service_manager_id})
            },
            relations: ["state"]
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
            if (checkIfWaitlist.slots_available <= 0) {
                return false;
            } else {
                return true;
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

    async countOrganizationServices(organization_id: number) {
        return await this.serviceDetailsRepository.count({
            where: {
                organization: {id: organization_id},
                is_submitted: true
            }
        })
    }

    async countOrganizationAdvocate(organization_id: number) {
        return await this.userRepository.count({
            where: {
                organization: {id: organization_id},
                role: {id: Constants.ROLE_ADVOCATE}
            }
        })
    }

    async assignServiceToManager(service_manager_id: number, service: any) {
        const managers = service.service_manager ?? [];

        if (!managers.includes(service_manager_id)) {
            managers.push(service_manager_id);
        }

        service.service_manager = managers;

        return await this.serviceDetailsRepository.save(service);
    }


    async removeServiceFromManager(service_manager_id: number, service: any) {
        const managers = service.service_manager ?? [];

        service.service_manager = managers.filter(id => id !== service_manager_id);

        return await this.serviceDetailsRepository.save(service);
    }

}

export function formatRoleName(role: string): string {
    return role
        .replace(/_/g, ' ')           // service_manager → service manager
        .toLowerCase()               // normalize casing
        .replace(/^\w/, c => c.toUpperCase()); // capitalize first letter
}

