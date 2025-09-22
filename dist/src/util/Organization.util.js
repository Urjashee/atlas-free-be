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
Object.defineProperty(exports, "__esModule", { value: true });
exports.getOrganizationsServiceDetails = getOrganizationsServiceDetails;
exports.getOrganizationsDetails = getOrganizationsDetails;
exports.getUserDetails = getUserDetails;
exports.getFormDetails = getFormDetails;
exports.getServiceRequests = getServiceRequests;
exports.getServiceRequestDetails = getServiceRequestDetails;
exports.removeOrganizationUser = removeOrganizationUser;
const User_service_1 = require("../services/User.service");
const Organization_service_1 = require("../services/Organization.service");
const Config_service_1 = require("../services/Config.service");
const ServiceDetails_entity_1 = require("../entity/ServiceDetails.entity");
const Common_util_1 = require("./Common.util");
const Constants_helper_1 = require("../helper/Constants.helper");
const Advocate_util_1 = require("./Advocate.util");
const Client_service_1 = require("../services/Client.service");
const Advocate_service_1 = require("../services/Advocate.service");
const userService = new User_service_1.UserService();
const organizationService = new Organization_service_1.OrganizationService();
const configService = new Config_service_1.ConfigService();
const clientService = new Client_service_1.ClientService();
const advocateService = new Advocate_service_1.AdvocateService();
function getOrganizationsServiceDetails(service) {
    return __awaiter(this, void 0, void 0, function* () {
        return {
            id: service.id,
            name: service.name,
            address: service.disclose_address == true ? `${service.address} ${service.street} ${service.city} ${service.state.name} ${service.zipcode}` : "",
            service_type_id: service.service_type,
            service_type: (yield configService.getServiceOptionsById(service.service_type)).name,
            service_type_icon: (yield configService.getServiceOptionsById(service.service_type)).icon,
            slots_beds_id: service.slots_beds,
            slots_beds: (yield configService.getServiceOptionsById(service.slots_beds)).name,
            client_slots: service.client_slots,
            client_slots_available: service.client_slots_available,
            start_day_of_service: new Date(service.start_day_of_service).toISOString().split('T')[0],
            service_limited: service.service_limited,
            enrollment_type_id: service.enrollment_type,
            enrollment_type: ServiceDetails_entity_1.TimePeriod[service.enrollment_type],
            enrollment_period: service.enrollment_period,
            extension: service.extension,
            waitlist: service.waitlist,
            service_description: service.service_description,
            minimum_age: service.minimum_age,
            maximum_age: service.maximum_age,
            genders_served: yield Promise.all(service.genders_served.map((item) => __awaiter(this, void 0, void 0, function* () {
                return {
                    id: item,
                    name: (yield configService.getServiceOptionsById(item)).name
                };
            }))),
            served_to: yield Promise.all(service.served_to.map((item) => __awaiter(this, void 0, void 0, function* () {
                return {
                    id: item,
                    name: (yield configService.getServiceOptionsById(item)).name
                };
            }))),
            minimum_children_age: service.minimum_children_age,
            maximum_children_age: service.maximum_children_age,
            maximum_children_intake: service.maximum_children_intake,
            citizenship_requirement: yield Promise.all(service.citizenship_requirement.map((item) => __awaiter(this, void 0, void 0, function* () {
                return {
                    id: item,
                    name: (yield configService.getServiceOptionsById(item)).name
                };
            }))),
            language_requirement: yield Promise.all(service.language_requirement.map((item) => __awaiter(this, void 0, void 0, function* () {
                return {
                    id: item,
                    name: (yield configService.getServiceOptionsById(item)).name
                };
            }))),
            out_of_state_relocation: service.out_of_state_relocation,
            trafficking_status: yield Promise.all(service.trafficking_status.map((item) => __awaiter(this, void 0, void 0, function* () {
                return {
                    id: item,
                    name: (yield configService.getServiceOptionsById(item)).name
                };
            }))),
            legal: yield Promise.all(service.legal.map((item) => __awaiter(this, void 0, void 0, function* () {
                return {
                    id: item,
                    name: (yield configService.getServiceOptionsById(item)).name
                };
            }))),
            health_needs: yield Promise.all(service.health_needs.map((item) => __awaiter(this, void 0, void 0, function* () {
                return {
                    id: item,
                    name: (yield configService.getServiceOptionsById(item)).name
                };
            }))),
            medications: yield Promise.all(service.medications.map((item) => __awaiter(this, void 0, void 0, function* () {
                return {
                    id: item,
                    name: (yield configService.getServiceOptionsById(item)).name
                };
            }))),
            mental_health_diagnoses: yield Promise.all(service.mental_health_diagnoses.map((item) => __awaiter(this, void 0, void 0, function* () {
                return {
                    id: item,
                    name: (yield configService.getServiceOptionsById(item)).name
                };
            }))),
            physical_accommodations: yield Promise.all(service.physical_accommodations.map((item) => __awaiter(this, void 0, void 0, function* () {
                return {
                    id: item,
                    name: (yield configService.getServiceOptionsById(item)).name
                };
            }))),
            smoking_allowed: yield Promise.all(service.smoking_allowed.map((item) => __awaiter(this, void 0, void 0, function* () {
                return {
                    id: item,
                    name: (yield configService.getServiceOptionsById(item)).name
                };
            }))),
            entry_requirement: yield Promise.all(service.entry_requirement.map((item) => __awaiter(this, void 0, void 0, function* () {
                return {
                    id: item,
                    name: (yield configService.getServiceOptionsById(item)).name
                };
            }))),
            days_sober: service.days_sober,
            service_model: yield Promise.all(service.service_model.map((item) => __awaiter(this, void 0, void 0, function* () {
                return {
                    id: item,
                    name: (yield configService.getServiceOptionsById(item)).name
                };
            }))),
            faith_engagement_id: service.faith_engagement,
            "faith_engagement": (yield configService.getServiceOptionsById(service.faith_engagement)).name,
            "faith_engagement_practice": service.faith_engagement_practice,
            service_structure_id: service.service_structure,
            "service_structure": (yield configService.getServiceOptionsById(service.service_structure)).name,
            sleeping_arrangement_id: service.sleeping_arrangement,
            "sleeping_arrangement": (yield configService.getServiceOptionsById(service.sleeping_arrangement)).name,
            staffing_level_id: service.staffing_level,
            "staffing_level": (yield configService.getServiceOptionsById(service.staffing_level)).name,
            "teams_diversity": yield Promise.all(service.teams_diversity.map((item) => __awaiter(this, void 0, void 0, function* () {
                return {
                    id: item,
                    name: (yield configService.getServiceOptionsById(item)).name
                };
            }))),
            "service_guidelines": yield Promise.all(service.service_guidelines.map((item) => __awaiter(this, void 0, void 0, function* () {
                return {
                    id: item,
                    name: (yield configService.getServiceOptionsById(item)).name
                };
            }))),
            "support_provided": yield Promise.all(service.support_provided.map((item) => __awaiter(this, void 0, void 0, function* () {
                return {
                    id: item,
                    name: (yield configService.getServiceOptionsById(item)).name
                };
            }))),
            "support_offered": yield Promise.all(service.support_offered.map((item) => __awaiter(this, void 0, void 0, function* () {
                return {
                    id: item,
                    name: (yield configService.getServiceOptionsById(item)).name
                };
            }))),
            intake_process: service.intake_process,
            additional_requirements: service.additional_requirements,
            reason_for_removal: service.reason_for_removal,
            is_submitted: service.is_submitted,
        };
    });
}
function getOrganizationsDetails(organization) {
    return __awaiter(this, void 0, void 0, function* () {
        const ids = organization.organization.primary_purpose.map(id => Number(id));
        const purposes = yield configService.getPrimaryPurposeById(ids);
        return {
            id: organization.organization.id,
            is_active: organization.organization.is_active,
            name: organization.organization.name,
            email: organization.email,
            country_code: organization.country_code,
            phone_no: organization.mobile,
            zipcode: organization.organization.zipcode,
            website: organization.organization.website,
            year: organization.organization.year,
            address: organization.organization.disclose_address == true ? organization.organization.address : "-",
            primary_purpose: purposes.map(purpose => ({
                id: purpose.id,
                name: purpose.name,
            })),
            tax_status: organization.organization.tax_exemption == false ? "No" : "Yes",
            affiliation: organization.organization.affiliations.map(item => {
                const fileUrl = item.affiliation_file;
                let type = "";
                if (fileUrl) {
                    const parts = fileUrl.split(".");
                    type = parts[parts.length - 1].toUpperCase();
                }
                return {
                    id: item.affiliation.id,
                    name: item.affiliation.name,
                    file: fileUrl,
                    size: item.file_size,
                    type
                };
            })
        };
    });
}
function getUserDetails(user) {
    return __awaiter(this, void 0, void 0, function* () {
        if (user.role.id === Constants_helper_1.Constants.ROLE_ORGANIZATION_ADMIN || user.role.id === Constants_helper_1.Constants.ROLE_ADVOCATE) {
            const getClients = yield organizationService.getOrganizationClientsByUserId(user.id);
            return {
                id: user.id,
                username: user.username,
                first_name: user.first_name,
                last_name: user.last_name,
                email: user.email,
                phone_no: user.mobile,
                country_code: user.country_code,
                role: (0, Common_util_1.getRoleNameById)(user.role.id),
                client: yield Promise.all(getClients.map((item) => ({
                    id: item.id,
                    client_number: item.case_no,
                    client_nick_name: item.client_service.client_nick_name,
                    dob: new Date(item.client_service.dob).toISOString().split('T')[0],
                    zipcode: item.client_service.zipcode,
                }))),
                created_at: new Date(user.created_at).toISOString().split('T')[0],
            };
        }
        if (user.role.id === Constants_helper_1.Constants.ROLE_SERVICE_MANAGER) {
            const getServices = yield organizationService.getOrganizationServicesByUserId(user.id);
            return {
                id: user.id,
                username: user.username,
                first_name: user.first_name,
                last_name: user.last_name,
                email: user.email,
                phone_no: user.mobile,
                country_code: user.country_code,
                role: (0, Common_util_1.getRoleNameById)(user.role.id),
                services: yield Promise.all(getServices.map((item) => __awaiter(this, void 0, void 0, function* () {
                    return ({
                        id: item.id,
                        name: item.name,
                        service_type: (yield configService.getServiceOptionsById(item.service_type)).name,
                        address: item.disclose_address == false ? `${item.address} ${item.street} ${item.city} ${item.state.name} ${item.zipcode}` : "",
                    });
                }))),
                created_at: new Date(user.created_at).toISOString().split('T')[0],
            };
        }
        return {
            id: user.id,
            username: user.username,
            first_name: user.first_name,
            last_name: user.last_name,
            email: user.email,
            phone_no: user.mobile,
            country_code: user.country_code,
            role: (0, Common_util_1.getRoleNameById)(user.role.id),
            created_at: new Date(user.created_at).toISOString().split('T')[0],
        };
    });
}
function getFormDetails(form) {
    return __awaiter(this, void 0, void 0, function* () {
        return {
            id: form.id,
            service_type: yield Promise.all(form.service.map((item) => __awaiter(this, void 0, void 0, function* () {
                return {
                    id: item,
                    name: (yield configService.getServiceOptionsById(item.service_type)).name
                };
            }))),
        };
    });
}
function getServiceRequests(organization_id, page_number, page_size, status) {
    return __awaiter(this, void 0, void 0, function* () {
        const { data, total } = yield organizationService.getServiceRequests(organization_id, page_number, page_size, status);
        const customResponse = [];
        for (const service of data) {
            const user = yield userService.findById(service.user.id);
            if (user.role.id != Constants_helper_1.Constants.ROLE_SURVIVOR) {
                customResponse.push({
                    type: "user",
                    id: service.id,
                    service_id: service.service.id,
                    service: service.service.name,
                    case_no: service.case_no,
                    requested_by: `${user.first_name} ${user.last_name}`,
                    date_time: service.created_at,
                    service_request: service.status,
                    client_service_id: service.client_service.id,
                    user: service.user.id
                });
            }
            if (user.role.id == Constants_helper_1.Constants.ROLE_SURVIVOR) {
                customResponse.push({
                    type: "survivor",
                    id: service.id,
                    service_id: service.service.id,
                    service: service.service.name,
                    client_name: `${user.user_name}`,
                    client_email: user.email,
                    date_time: service.created_at,
                    service_request: service.status,
                    client_service_id: service.client_service.id,
                    user: service.user.id
                });
            }
        }
        return {
            current_page: page_number,
            page_size,
            total_items: total,
            total_pages: Math.ceil(total / page_size),
            data: customResponse
        };
    });
}
function getServiceRequestDetails(serviceRequestsId) {
    return __awaiter(this, void 0, void 0, function* () {
        const getServiceRequest = yield clientService.getServiceRequestById(serviceRequestsId);
        if (!getServiceRequest) {
            throw new Error("Service request not found");
        }
        let client, form;
        const user = yield userService.findById(getServiceRequest.user.id);
        const getClients = yield advocateService.getClientsById(getServiceRequest.id);
        if (user.role.id != Constants_helper_1.Constants.ROLE_SURVIVOR) {
            client = {
                type: "user",
                id: getServiceRequest.id,
                service_id: getServiceRequest.service.id,
                service: getServiceRequest.service.name,
                case_no: getServiceRequest.case_no,
                requested_by: `${user.first_name} ${user.last_name}`,
                date_time: getServiceRequest.created_at,
                service_request: getServiceRequest.status,
                client_service_id: getServiceRequest.client_service.id,
                user: getServiceRequest.user.id
            };
            form = yield (0, Advocate_util_1.getClientDetails)(getClients, Constants_helper_1.Constants.ROLE_ADVOCATE);
        }
        if (user.role.id == Constants_helper_1.Constants.ROLE_SURVIVOR) {
            client = {
                type: "survivor",
                id: getServiceRequest.id,
                service_id: getServiceRequest.service.id,
                service: getServiceRequest.service.name,
                client_name: `${user.user_name}`,
                client_email: user.email,
                date_time: getServiceRequest.created_at,
                service_request: getServiceRequest.status,
                client_service_id: getServiceRequest.client_service.id,
                user: getServiceRequest.user.id
            };
            form = yield (0, Advocate_util_1.getClientDetails)(getClients, Constants_helper_1.Constants.ROLE_SURVIVOR);
        }
        return {
            client: client,
            form: form,
        };
    });
}
function removeOrganizationUser(organization_id, user_id, email, user, role_id) {
    return __awaiter(this, void 0, void 0, function* () {
        const checkIfValidUser = yield organizationService.checkIfOrganizationUser(user_id, organization_id);
        if (!checkIfValidUser) {
            throw new Error("User not found in organization");
        }
        if (checkIfValidUser.role.id != role_id) {
            throw new Error("Not a valid user type");
        }
        const checkIfEmail = yield organizationService.checkIfEmailIsRoleUser(email, user_id, organization_id, role_id);
        if (!checkIfEmail) {
            if (role_id === Constants_helper_1.Constants.ROLE_ORGANIZATION_ADMIN) {
                throw new Error("Email provided is not an organization admin");
            }
            if (role_id === Constants_helper_1.Constants.ROLE_SERVICE_MANAGER) {
                throw new Error("Email provided is not a service manager");
            }
            if (role_id === Constants_helper_1.Constants.ROLE_ADVOCATE) {
                throw new Error("Email provided is not an advocate");
            }
        }
        //     replace service manager from service settings
        if (role_id == Constants_helper_1.Constants.ROLE_SERVICE_MANAGER) {
            const removeServiceManagerFromSettings = yield organizationService.removeUserFromSettings(user_id, checkIfEmail.id);
            if (!removeServiceManagerFromSettings) {
                throw new Error("Can't remove service manager from service settings. Try again later");
            }
        }
        //     replace service request
        const removeAdvocateServiceRequest = yield organizationService.removeUserServiceRequest(user_id, checkIfEmail.id);
        if (!removeAdvocateServiceRequest) {
            throw new Error("Can't remove user from service request. Try again later");
        }
        //     replace client
        const removeAdvocateClients = yield organizationService.removeUserClients(user_id, checkIfEmail.id);
        if (!removeAdvocateClients) {
            throw new Error("Can't remove user from clients. Try again later");
        }
        //     replace service details
        const removeAdvocateServiceDetails = yield organizationService.removeServiceDetails(user_id, checkIfEmail.id);
        if (!removeAdvocateServiceDetails) {
            throw new Error("Can't remove service details. Try again later");
        }
        // remove reported user
        const removeReportedUser = yield organizationService.removeReportedUser(user_id, user);
        if (!removeReportedUser) {
            throw new Error("Can't remove reported user. Try again later");
        }
        // remove reported service
        const removeReportedService = yield organizationService.removeReportedService(user_id, user);
        if (!removeReportedService) {
            throw new Error("Can't remove reported service. Try again laterr");
        }
        // delete password reset
        yield userService.passwordResetDelete(user_id);
        // delete device token
        yield userService.deleteDeviceTokenForAllUser(user_id);
        //     delete organization admin
        const deleteOrganizationAdmin = yield userService.deleteUser(user_id, role_id);
        if (!deleteOrganizationAdmin) {
            throw new Error("Can't remove organization admin. Try again later");
        }
    });
}
