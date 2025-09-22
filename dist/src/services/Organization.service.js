"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.OrganizationService = void 0;
const ormconfig_1 = __importDefault(require("../../ormconfig"));
const Users_entity_1 = require("../entity/Users.entity");
const Constants_helper_1 = require("../helper/Constants.helper");
const crypto_1 = require("crypto");
const PasswordReset_entity_1 = require("../entity/PasswordReset.entity");
const Emails_helper_1 = require("../helper/Emails.helper");
const Email_service_1 = require("./Email.service");
const typeorm_1 = require("typeorm");
const ServiceDetails_entity_1 = require("../entity/ServiceDetails.entity");
const Organization_entity_1 = require("../entity/Organization.entity");
const EmailReminder_entity_1 = require("../entity/EmailReminder.entity");
const AssignedServices_entity_1 = require("../entity/AssignedServices.entity");
const ReportUser_1 = require("../entity/ReportUser");
const ClientService_entity_1 = require("../entity/ClientService.entity");
const ReportService_entity_1 = require("../entity/ReportService.entity");
class OrganizationService {
    constructor() {
        this.userRepository = ormconfig_1.default.getRepository(Users_entity_1.Users);
        this.organizationRepository = ormconfig_1.default.getRepository(Organization_entity_1.Organization);
        this.passwordResetRepository = ormconfig_1.default.getRepository(PasswordReset_entity_1.PasswordReset);
        this.serviceDetailsRepository = ormconfig_1.default.getRepository(ServiceDetails_entity_1.ServiceDetails);
        this.emailReminderRepository = ormconfig_1.default.getRepository(EmailReminder_entity_1.EmailReminder);
        this.assignedServiceRepository = ormconfig_1.default.getRepository(AssignedServices_entity_1.AssignedServices);
        this.reportUserRepository = ormconfig_1.default.getRepository(ReportUser_1.ReportUser);
        this.reportServiceRepository = ormconfig_1.default.getRepository(ReportService_entity_1.ReportService);
        this.clientServiceRepository = ormconfig_1.default.getRepository(ClientService_entity_1.ClientService);
        this.mailerService = new Email_service_1.EmailService();
    }
    getOrganizations(filter) {
        return __awaiter(this, void 0, void 0, function* () {
            if (filter === "active") {
                return yield this.userRepository
                    .createQueryBuilder('user')
                    .leftJoinAndSelect('user.organization', 'organization')
                    .leftJoinAndSelect('organization.affiliations', 'affiliations')
                    .leftJoinAndSelect('affiliations.affiliation', 'registrationOption')
                    .andWhere('user.role_id = :roleId', { roleId: Constants_helper_1.Constants.ROLE_ORGANIZATION_ADMIN })
                    .andWhere('organization.is_active = :orgActive', { orgActive: true })
                    .andWhere('organization.under_review = :underReview', { underReview: false })
                    .getMany();
            }
            if (filter === "inactive") {
                return yield this.userRepository
                    .createQueryBuilder('user')
                    .leftJoinAndSelect('user.organization', 'organization')
                    .leftJoinAndSelect('organization.affiliations', 'affiliations')
                    .leftJoinAndSelect('affiliations.affiliation', 'registrationOption')
                    .andWhere('user.role_id = :roleId', { roleId: Constants_helper_1.Constants.ROLE_ORGANIZATION_ADMIN })
                    .andWhere('organization.is_active = :orgActive', { orgActive: false })
                    .andWhere('organization.under_review = :underReview', { underReview: false })
                    // .andWhere('user.is_active = :userActive', {userActive: true})
                    .getMany();
            }
            if (filter === "pending") {
                return yield this.userRepository
                    .createQueryBuilder('user')
                    .leftJoinAndSelect('user.organization', 'organization')
                    .leftJoinAndSelect('organization.affiliations', 'affiliations')
                    .leftJoinAndSelect('affiliations.affiliation', 'registrationOption')
                    .andWhere('user.role_id = :roleId', { roleId: Constants_helper_1.Constants.ROLE_ORGANIZATION_ADMIN })
                    .andWhere('organization.is_active = :orgActive', { orgActive: true })
                    .andWhere('organization.under_review = :underReview', { underReview: true })
                    // .andWhere('user.is_active = :userActive', {userActive: true})
                    .getMany();
            }
        });
    }
    updateStatus(organization_id) {
        return __awaiter(this, void 0, void 0, function* () {
            const organization = yield this.userRepository.findOne({
                where: {
                    organization: { id: organization_id },
                    role: { id: Constants_helper_1.Constants.ROLE_ORGANIZATION_ADMIN }
                },
                relations: ['organization']
            });
            if (organization) {
                if (organization.organization.is_active == true && organization.organization.under_review == false) {
                    organization.organization.is_active = false;
                    yield this.organizationRepository.save(organization.organization);
                    return organization.organization;
                }
                if ((organization.organization.is_active == false) || (organization.organization.is_active == true && organization.organization.under_review == true)) {
                    organization.organization.is_active = true;
                    organization.organization.under_review = false;
                    const token = (0, crypto_1.randomBytes)(32).toString('hex');
                    if (organization.emailVerifiedAt === null) {
                        const password_reset_request = this.passwordResetRepository.create({
                            email: organization.email,
                            token,
                            type: Constants_helper_1.Constants.CREATE_PASSWORD,
                            user: { id: organization.id }
                        });
                        yield this.passwordResetRepository.save(password_reset_request);
                        const emailContent = (0, Emails_helper_1.CreatePassword)(organization.user_name, organization.email, token, Constants_helper_1.Constants.CREATE_PASSWORD, organization.role.id);
                        const mailOptions = {
                            from: `"${process.env.MAIL_FROM_NAME}" <${process.env.MAIL_FROM_ADDRESS}>`,
                            to: organization.email,
                            subject: "Email from Atlas free!",
                            html: emailContent
                        };
                        yield this.mailerService.sendEmail(mailOptions);
                    }
                    else if (organization.emailVerifiedAt) {
                        organization.is_status = true;
                        const password_reset_request = this.passwordResetRepository.create({
                            email: organization.email,
                            token,
                            type: Constants_helper_1.Constants.CREATE_PASSWORD,
                            user: { id: organization.id }
                        });
                        const emailContent = (0, Emails_helper_1.ActivateOrganization)(organization.user_name, organization.email, token, Constants_helper_1.Constants.ACTIVATE_ORGANIZATION);
                        const mailOptions = {
                            from: `"${process.env.MAIL_FROM_NAME}" <${process.env.MAIL_FROM_ADDRESS}>`,
                            to: organization.email,
                            subject: "Email from Atlas free!",
                            html: emailContent
                        };
                        yield this.mailerService.sendEmail(mailOptions);
                        yield this.passwordResetRepository.save(password_reset_request);
                    }
                    yield this.userRepository.save(organization);
                    yield this.organizationRepository.save(organization.organization);
                    return organization.organization;
                }
            }
        });
    }
    addServiceDetails(organization_id, role, body, user_id) {
        return __awaiter(this, void 0, void 0, function* () {
            const addService = yield this.serviceDetailsRepository.create({
                organization: { id: organization_id },
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
                role: { id: role },
                user: { id: user_id }
            });
            return yield this.serviceDetailsRepository.save(addService);
        });
    }
    editServiceDetails(id, organization_id, role, body, user_id) {
        return __awaiter(this, void 0, void 0, function* () {
            const getService = yield this.serviceDetailsRepository.findOne({
                where: {
                    id: id,
                    organization: { id: organization_id },
                }
            });
            if (getService) {
                getService.name = body.name;
                getService.street = body.street;
                getService.address = body.address;
                getService.state = body.state;
                getService.city = body.city;
                getService.zipcode = body.zipcode;
                getService.disclose_address = body.disclose_address === true || body.disclose_address === 'true';
                getService.is_organization_address = body.is_organization_address === true || body.is_organization_address === 'true';
                getService.service_type = body.service_type;
                getService.total_available_slots = body.client_slots;
                getService.slots_beds = body.slots_beds;
                getService.start_day_of_service = body.start_day_of_service;
                getService.service_limited = body.service_limited === true || body.service_limited === 'true';
                getService.enrollment_type = body.enrollment_type;
                getService.enrollment_period = body.enrollment_period;
                getService.extension = body.extension === true || body.extension === 'true';
                getService.waitlist = body.waitlist === true || body.waitlist === 'true';
                getService.service_description = body.service_description;
                getService.minimum_age = body.minimum_age;
                getService.maximum_age = body.maximum_age;
                getService.genders_served = body.genders_served;
                getService.served_to = body.served_to;
                getService.minimum_children_age = body.minimum_children_age;
                getService.maximum_children_age = body.maximum_children_age;
                getService.maximum_children_intake = body.maximum_children_intake;
                getService.citizenship_requirement = body.citizenship_requirement;
                getService.language_requirement = body.language_requirement;
                getService.out_of_state_relocation = body.out_of_state_relocation === true || body.out_of_state_relocation === 'true';
                getService.trafficking_status = body.trafficking_status;
                getService.legal = body.legal;
                getService.health_needs = body.health_needs;
                getService.medications = body.medications;
                getService.mental_health_diagnoses = body.mental_health_diagnoses;
                getService.physical_accommodations = body.physical_accommodations;
                getService.smoking_allowed = body.smoking_allowed;
                getService.entry_requirement = body.entry_requirement;
                getService.days_sober = body.days_sober;
                getService.service_model = body.service_model;
                getService.faith_engagement = body.faith_engagement;
                getService.faith_engagement_practice = body.faith_engagement_practice;
                getService.service_structure = body.service_structure;
                getService.sleeping_arrangement = body.sleeping_arrangement;
                getService.staffing_level = body.staffing_level;
                getService.teams_diversity = body.teams_diversity;
                getService.service_guidelines = body.service_guidelines;
                getService.support_provided = body.support_provided;
                getService.support_offered = body.support_offered;
                getService.intake_process = body.intake_process;
                getService.additional_requirements = body.additional_requirements;
                getService.reason_for_removal = body.reason_for_removal;
                getService.is_submitted = body.is_submitted === true || body.is_submitted === 'true';
                return yield this.serviceDetailsRepository.save(getService);
            }
            return false;
        });
    }
    checkIfValidOrganization(id, organization_id) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.serviceDetailsRepository.findOne({
                where: {
                    id: id,
                    organization: { id: organization_id }
                }
            });
        });
    }
    getOrganizationsService(organization) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.serviceDetailsRepository.find({
                where: {
                    organization: { id: organization }
                },
                relations: ['organization', 'state'],
            });
        });
    }
    getOrganizationsServiceById(id) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.serviceDetailsRepository.findOne({
                where: {
                    id: id
                },
                relations: ['organization']
            });
        });
    }
    getOrganizationsById(id) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.userRepository
                .createQueryBuilder('user')
                .leftJoinAndSelect('user.organization', 'organization')
                .leftJoinAndSelect('organization.affiliations', 'affiliations')
                .leftJoinAndSelect('affiliations.affiliation', 'registrationOption')
                .andWhere('user.role_id = :roleId', { roleId: Constants_helper_1.Constants.ROLE_ORGANIZATION_ADMIN })
                .andWhere('organization.id = :orgId', { orgId: id })
                .getOne();
        });
    }
    checkIfEmailAlreadyInUse(email) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.userRepository.findOne({
                where: {
                    email
                }
            });
        });
    }
    sendInvitation(email, role, organization_id, organization_name) {
        return __awaiter(this, void 0, void 0, function* () {
            const sendInvitation = yield this.userRepository.create({
                email: email,
                role: { id: role },
                organization: { id: organization_id },
            });
            const token = (0, crypto_1.randomBytes)(32).toString('hex');
            const invitation = yield this.userRepository.save(sendInvitation);
            const password_reset_request = this.passwordResetRepository.create({
                email: email,
                token,
                type: Constants_helper_1.Constants.SEND_INVITATION,
                user: { id: sendInvitation.id }
            });
            yield this.passwordResetRepository.save(password_reset_request);
            if (invitation) {
                const emailContent = (0, Emails_helper_1.SendInvitationEmail)(email, token, Constants_helper_1.Constants.SEND_INVITATION, role, organization_name);
                const mailOptions = {
                    from: `"${process.env.MAIL_FROM_NAME}" <${process.env.MAIL_FROM_ADDRESS}>`,
                    to: email,
                    subject: "Email from Atlas free!",
                    html: emailContent
                };
                yield this.mailerService.sendEmail(mailOptions);
            }
            return invitation;
        });
    }
    resendInvitation(user_id, email, role, organization_id, organization_name) {
        return __awaiter(this, void 0, void 0, function* () {
            const token = (0, crypto_1.randomBytes)(32).toString('hex');
            const password_reset_request = this.passwordResetRepository.create({
                email: email,
                token,
                type: Constants_helper_1.Constants.SEND_INVITATION,
                user: { id: user_id }
            });
            const password_resets = yield this.passwordResetRepository.save(password_reset_request);
            if (password_resets) {
                const emailContent = (0, Emails_helper_1.SendInvitationEmail)(email, token, Constants_helper_1.Constants.SEND_INVITATION, role, organization_name);
                const mailOptions = {
                    from: `"${process.env.MAIL_FROM_NAME}" <${process.env.MAIL_FROM_ADDRESS}>`,
                    to: email,
                    subject: "Email from Atlas free!",
                    html: emailContent
                };
                yield this.mailerService.sendEmail(mailOptions);
            }
            return password_resets;
        });
    }
    getOrgUsers(organization_id) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.userRepository.find({
                where: {
                    organization: { id: organization_id },
                    is_active: true,
                    is_status: true
                },
                order: { created_at: "DESC" }
            });
        });
    }
    getOrgUsersDetails(organization_id) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.userRepository.find({
                where: {
                    organization: { id: organization_id },
                    is_active: true,
                    is_status: true
                },
                order: { created_at: "DESC" }
            });
        });
    }
    getServices(page_number, page_size, service_type, state, city, zipcode, availability, structure, staffing, substance, children, faith, living_arrangement, guidelines, staff_diversity) {
        return __awaiter(this, void 0, void 0, function* () {
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
            const baseWhere = {
                service_type,
            };
            let where = baseWhere;
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
            const [data, total] = yield this.serviceDetailsRepository.findAndCount({
                where,
                skip: (page_number - 1) * page_size,
                take: page_size,
            });
            return { data, total };
        });
    }
    checkIfOrganization(organization_id) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.organizationRepository.findOne({
                where: {
                    id: organization_id,
                }
            });
        });
    }
    checkIfServiceExists(service_id) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.serviceDetailsRepository.findOne({
                where: {
                    id: service_id
                }
            });
        });
    }
    editServiceSettings(body) {
        return __awaiter(this, void 0, void 0, function* () {
            const serviceSetting = yield this.serviceDetailsRepository.findOne({
                where: {
                    id: body.service_id
                }
            });
            console.log(serviceSetting);
            if (serviceSetting) {
                serviceSetting.slots_available = body.available_slots;
                serviceSetting.service_manager = body.service_manager;
                serviceSetting.contact_email = body.contact_email;
                serviceSetting.contact_phone = body.contact_phone;
                yield this.serviceDetailsRepository.save(serviceSetting);
            }
            else {
                return false;
            }
            const existingReminders = yield this.emailReminderRepository.find({
                where: { service: { id: body.service_id } },
            });
            const incoming = body.emailReminders || [];
            // Force all processedIds to be numbers
            const processedIds = [];
            for (const reminder of incoming) {
                if (reminder.id) {
                    const reminderId = parseInt(reminder.id);
                    // Check if this ID actually exists
                    const existing = existingReminders.find(er => er.id === reminderId);
                    if (existing) {
                        yield this.emailReminderRepository.update(reminderId, {
                            email: reminder.email,
                            day_of_week: reminder.day_of_week,
                            time: reminder.time,
                            time_zone: reminder.time_zone,
                        });
                        processedIds.push(reminderId);
                    }
                    else {
                        console.warn(`Skipping update: reminder ID ${reminderId} not found.`);
                    }
                }
                else {
                    // Create new reminder
                    const newReminder = this.emailReminderRepository.create({
                        service: { id: body.service_id },
                        email: reminder.email,
                        day_of_week: reminder.day_of_week,
                        time: reminder.time,
                        time_zone: reminder.time_zone,
                    });
                    const saved = yield this.emailReminderRepository.save(newReminder);
                    processedIds.push(saved.id);
                }
            }
            // Delete only those that are not in processed list
            for (const existing of existingReminders) {
                if (!processedIds.includes(existing.id)) {
                    yield this.emailReminderRepository.remove(existing);
                }
            }
            return serviceSetting;
        });
    }
    getServiceSettingsById(service_id) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.serviceDetailsRepository.findOne({
                where: {
                    id: service_id
                },
            });
        });
    }
    getEmailRemindersByServiceId(service_id) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.emailReminderRepository.find({
                where: {
                    service: { id: service_id }
                },
            });
        });
    }
    getServiceManager(service_managers) {
        return __awaiter(this, void 0, void 0, function* () {
            const userArray = [];
            for (const service_manager of service_managers) {
                const user = yield this.userRepository.findOne({
                    where: {
                        id: service_manager
                    },
                });
                userArray.push({
                    id: user.id,
                    name: `${user.first_name} ${user.last_name}`,
                });
            }
            return userArray;
        });
    }
    getServiceRequests(user_id_1) {
        return __awaiter(this, arguments, void 0, function* (user_id, page_number = 1, page_size = 10, status) {
            const skip = (page_number - 1) * page_size;
            const where = {
                organization: { id: user_id },
            };
            if (typeof status === 'number' && status !== AssignedServices_entity_1.ClientStatus.All) {
                where.status = status;
            }
            const [data, total] = yield this.assignedServiceRepository.findAndCount({
                where,
                relations: ["organization", "service", "service.state", "client_service", "user"],
                skip,
                take: page_size,
                order: { created_at: "DESC" }
            });
            return { data, total };
        });
    }
    reportUser(type, reported_user, reason, user_id, organization_id) {
        return __awaiter(this, void 0, void 0, function* () {
            const report = yield this.reportUserRepository.create({
                reported_user: { id: reported_user },
                reason: reason,
                reported_by: { id: user_id },
                organization: { id: organization_id },
                type
            });
            const reportedUser = yield this.userRepository.findOne({
                where: { id: reported_user },
                select: ["id", "first_name", "last_name", "user_name"]
            });
            const emailContent = (0, Emails_helper_1.ReportUserEmail)(reportedUser.user_name == null ? `${reportedUser.first_name} ${reportedUser.last_name}` : reportedUser.user_name, reason, "user");
            const mailOptions = {
                from: `"${process.env.MAIL_FROM_NAME}" <${process.env.MAIL_FROM_ADDRESS}>`,
                to: process.env.SUPER_ADMIN_MAIN,
                subject: "Email from Atlas free!",
                html: emailContent
            };
            yield this.mailerService.sendEmail(mailOptions);
            return yield this.reportUserRepository.save(report);
        });
    }
    getServiceRequestsById(client_id) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.assignedServiceRepository.findOne({
                where: {
                    client_service: { id: client_id }
                },
                relations: ["organization", "service", "service.state", "client_service", "user"],
            });
        });
    }
    checkIfOrganizationRoleUser(user_id, role) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.userRepository.findOne({
                where: {
                    id: user_id,
                    role: { id: role },
                }
            });
        });
    }
    checkIfOrganizationUser(user_id, organization_id) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.userRepository.findOne({
                where: {
                    id: user_id,
                    organization: { id: organization_id },
                }
            });
        });
    }
    checkIfClientCreatedByUser(client_id, user_id) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.assignedServiceRepository.findOne({
                where: {
                    client_service: { id: client_id },
                    user: { id: user_id },
                }
            });
        });
    }
    checkIfOrganizationClient(user_id, id) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.clientServiceRepository.findOne({
                where: {
                    id,
                    user: { id: user_id },
                },
                relations: ["user", "organization"]
            });
        });
    }
    checkIfOrganizationIsAvailable(organization_id) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.userRepository.findOne({
                where: {
                    organization: { id: organization_id },
                },
                relations: ["organization", "organization.affiliations"]
            });
        });
    }
    getOrganizationServices(organization_id) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.serviceDetailsRepository.find({
                where: {
                    organization: { id: organization_id },
                    is_submitted: true
                },
                relations: ["organization"]
            });
        });
    }
    getUserByOrganization(organization_id, role) {
        return __awaiter(this, void 0, void 0, function* () {
            const whereCondition = {
                organization: { id: organization_id }
            };
            if (role !== 0) {
                whereCondition.role = { id: role };
            }
            return yield this.userRepository.find({
                where: whereCondition,
                order: { created_at: "DESC" }
            });
        });
    }
    getOrganizationServicesByUserId(service_manager_id) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.serviceDetailsRepository.find({
                where: {
                    service_manager: (0, typeorm_1.Raw)(alias => `FIND_IN_SET(:service_manager_id, ${alias}) > 0`, { service_manager_id })
                },
                relations: ["state"]
            });
        });
    }
    checkIfUserInService(service_manager_id, service_id) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.serviceDetailsRepository.findOne({
                where: {
                    id: service_id,
                    service_manager: (0, typeorm_1.Raw)(alias => `FIND_IN_SET(:service_manager_id, ${alias}) > 0`, { service_manager_id })
                },
                relations: ["state"]
            });
        });
    }
    getOrganizationClientsByUserId(user_id) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.assignedServiceRepository.find({
                where: {
                    user: { id: user_id },
                },
                relations: ["client_service"],
            });
        });
    }
    checkIfServiceInOrganization(organization_id, service_id) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.serviceDetailsRepository.find({
                where: {
                    id: service_id,
                    organization: { id: organization_id },
                }
            });
        });
    }
    checkIfEmailIsRoleUser(email, user_id, organization_id, role) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.userRepository.findOne({
                where: {
                    email,
                    role: { id: role },
                    id: (0, typeorm_1.Not)(user_id),
                    organization: { id: organization_id }
                }
            });
        });
    }
    removeUserFromService(service_manager_id, service_id) {
        return __awaiter(this, void 0, void 0, function* () {
            const serviceSetting = yield this.serviceDetailsRepository.findOne({
                where: {
                    id: service_id,
                    service_manager: (0, typeorm_1.Raw)(() => `FIND_IN_SET(:idStr, service_manager) > 0`, {
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
            serviceSetting.service_manager = serviceSetting.service_manager.filter(id => id !== service_manager_id);
            // if (!serviceSetting.service_manager.includes(replace_id)) {
            //     serviceSetting.service_manager.push(replace_id);
            // }
            console.log("After replacement:", serviceSetting.service_manager);
            const settings = yield this.serviceDetailsRepository.save(serviceSetting);
            console.log(`Removed service_manager_id ${service_manager_id} from serviceSetting ${serviceSetting.id}`);
            return settings;
        });
    }
    removeUserClient(client_id) {
        return __awaiter(this, void 0, void 0, function* () {
            const client = yield this.assignedServiceRepository.findOne({
                where: {
                    client_service: { id: client_id }
                }
            });
            if (client) {
                const getClient = yield this.clientServiceRepository.findOne({
                    where: {
                        id: client_id
                    }
                });
                if (getClient) {
                    yield this.assignedServiceRepository.delete(client.id);
                    return yield this.clientServiceRepository.delete(getClient.id);
                }
            }
            return true;
        });
    }
    checkIfSlotAvailable(service_id, organization_id) {
        return __awaiter(this, void 0, void 0, function* () {
            const checkIfWaitlist = yield this.serviceDetailsRepository.findOne({
                where: {
                    id: service_id,
                    organization: { id: organization_id },
                }
            });
            if (checkIfWaitlist.waitlist == true) {
                if (checkIfWaitlist.slots_available >= checkIfWaitlist.total_available_slots) {
                    return false;
                }
                else {
                    return true;
                }
            }
            return true;
        });
    }
    checkIfServiceRequestExists(organization_id, service_request) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.assignedServiceRepository.findOne({
                where: {
                    organization: { id: organization_id },
                    id: service_request
                },
                relations: ["organization", "service", "service.state", "client_service", "user"]
            });
        });
    }
    removeUserFromSettings(service_manager_id, assigned_user_id) {
        return __awaiter(this, void 0, void 0, function* () {
            const serviceSettings = yield this.serviceDetailsRepository.find({
                where: {
                    service_manager: (0, typeorm_1.Raw)(() => `FIND_IN_SET(:idStr, service_manager) > 0`, {
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
                serviceSetting.service_manager = serviceSetting.service_manager.filter(id => id !== service_manager_id);
                if (!serviceSetting.service_manager.includes(assigned_user_id)) {
                    serviceSetting.service_manager.push(assigned_user_id);
                }
                console.log("After replacement:", serviceSetting.service_manager);
                yield this.serviceDetailsRepository.save(serviceSetting);
                console.log(`Removed service_manager_id ${service_manager_id} from serviceSetting ${serviceSetting.id}`);
            }
            return true;
        });
    }
    removeUserServiceRequest(service_manager_id, assigned_user_id) {
        return __awaiter(this, void 0, void 0, function* () {
            const assignedServices = yield this.assignedServiceRepository.find({
                where: {
                    user: { id: service_manager_id },
                },
                relations: ["user", "service", "service.state", "client_service"]
            });
            if (assignedServices) {
                for (const assignedService of assignedServices) {
                    if (assignedService.user.id == service_manager_id) {
                        assignedService.user = assigned_user_id;
                        yield this.assignedServiceRepository.save(assignedService);
                    }
                }
                return true;
            }
        });
    }
    removeUserClients(service_manager_id, assigned_user_id) {
        return __awaiter(this, void 0, void 0, function* () {
            const clients = yield this.clientServiceRepository.find({
                where: {
                    user: { id: service_manager_id },
                },
                relations: ["user"]
            });
            if (clients) {
                for (const client of clients) {
                    if (client.user.id == service_manager_id) {
                        client.user = assigned_user_id;
                        yield this.clientServiceRepository.save(client);
                    }
                }
            }
            return true;
        });
    }
    removeServiceDetails(service_manager_id, assigned_user_id) {
        return __awaiter(this, void 0, void 0, function* () {
            const service_details = yield this.serviceDetailsRepository.find({
                where: {
                    user: { id: service_manager_id },
                },
                relations: ["user"]
            });
            if (service_details) {
                for (const service_detail of service_details) {
                    if (service_detail.user.id == service_manager_id) {
                        service_detail.user = assigned_user_id;
                        yield this.serviceDetailsRepository.save(service_detail);
                    }
                }
            }
            return true;
        });
    }
    removeReportedUser(user_id, admin_id) {
        return __awaiter(this, void 0, void 0, function* () {
            const reportedByUsers = yield this.reportUserRepository.find({
                where: {
                    reported_by: { id: user_id }
                },
                relations: ['reported_by']
            });
            if (reportedByUsers) {
                for (const reportedByUser of reportedByUsers) {
                    if (reportedByUser.reported_by.id == user_id) {
                        reportedByUser.reported_by.id = admin_id;
                        yield this.reportUserRepository.save(reportedByUser);
                    }
                }
            }
            const reportedUsers = yield this.reportUserRepository.find({
                where: {
                    reported_user: { id: user_id }
                },
                relations: ['reported_user']
            });
            if (reportedUsers) {
                for (const reportedUser of reportedUsers) {
                    if (reportedUser.reported_user.id == user_id) {
                        yield this.reportUserRepository.delete(reportedUser.id);
                    }
                }
            }
            return true;
        });
    }
    removeReportedService(user_id, admin_id) {
        return __awaiter(this, void 0, void 0, function* () {
            const reportedByServices = yield this.reportServiceRepository.find({
                where: {
                    user: { id: user_id }
                },
                relations: ['user']
            });
            if (reportedByServices) {
                for (const reportedByService of reportedByServices) {
                    if (reportedByService.user.id == user_id) {
                        reportedByService.user.id = admin_id;
                        yield this.reportServiceRepository.save(reportedByService);
                    }
                }
            }
            return true;
        });
    }
    removeAssignedService(service_id) {
        return __awaiter(this, void 0, void 0, function* () {
            const assignedServices = yield this.assignedServiceRepository.find({
                where: {
                    service: { id: service_id }
                },
                relations: ["service"]
            });
            if (assignedServices) {
                for (const assignedService of assignedServices) {
                    if (assignedService.service.id == service_id) {
                        yield this.assignedServiceRepository.delete(assignedService.id);
                    }
                }
            }
            return true;
        });
    }
    removeServiceSettings(service_id) {
        return __awaiter(this, void 0, void 0, function* () {
            const emailReminders = yield this.emailReminderRepository.find({
                where: {
                    service: { id: service_id }
                }
            });
            console.log("emailReminders: ", emailReminders);
            if (emailReminders) {
                for (const emailReminder of emailReminders) {
                    yield this.emailReminderRepository.delete(emailReminder.id);
                }
            }
            return true;
        });
    }
    removeService(service_id) {
        return __awaiter(this, void 0, void 0, function* () {
            const service = yield this.serviceDetailsRepository.findOne({
                where: {
                    id: service_id,
                }
            });
            if (service) {
                yield this.serviceDetailsRepository.delete(service.id);
                return true;
            }
            return false;
        });
    }
    getClientsByOrganization(organization_id) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.clientServiceRepository.find({
                where: {
                    organization: { id: organization_id },
                },
                order: { created_at: "DESC" }
            });
        });
    }
    checkIfOrganizationClientExists(organization_id, client_id) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.clientServiceRepository.findOne({
                where: {
                    id: client_id,
                    organization: { id: organization_id },
                }
            });
        });
    }
}
exports.OrganizationService = OrganizationService;
