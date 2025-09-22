"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
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
exports.AdminController = void 0;
const routing_controllers_1 = require("routing-controllers");
const Auth_middleware_1 = require("../middleware/Auth.middleware");
const Admin_middleware_1 = require("../middleware/Admin.middleware");
const ResponseFormatter_helper_1 = require("../helper/ResponseFormatter.helper");
const Organization_service_1 = require("../services/Organization.service");
const Config_service_1 = require("../services/Config.service");
const MulterConfig_helper_1 = require("../helper/MulterConfig.helper");
const joi_1 = __importDefault(require("joi"));
const User_service_1 = require("../services/User.service");
const Organization_util_1 = require("../util/Organization.util");
const Common_util_1 = require("../util/Common.util");
const Organization_middleware_1 = require("../middleware/Organization.middleware");
const Organization_schema_1 = require("../schema/Organization.schema");
const Constants_helper_1 = require("../helper/Constants.helper");
const Admin_schema_1 = require("../schema/Admin.schema");
const Services_schema_1 = require("../schema/Services.schema");
const EmailReminder_entity_1 = require("../entity/EmailReminder.entity");
const Common_util_2 = require("../util/Common.util");
const Client_service_1 = require("../services/Client.service");
const Client_schema_1 = require("../schema/Client.schema");
const Advocate_util_1 = require("../util/Advocate.util");
const ServiceRequest_util_1 = require("../util/ServiceRequest.util");
const Advocate_service_1 = require("../services/Advocate.service");
const Common_util_3 = require("../util/Common.util");
const adminOrgEditSchema = joi_1.default.object({
    organization_id: joi_1.default.number().required(),
    country_code: joi_1.default.string().min(2).max(5).required(),
    phone_no: joi_1.default.string().pattern(/^\d+$/).min(6).max(16).required(),
    address: joi_1.default.string().min(3).max(1600).required(),
    disclose_address: joi_1.default.boolean().required(),
    zipcode: joi_1.default.string().min(4).max(10).required(),
    year: joi_1.default.string().min(4).max(5).required(),
    website: joi_1.default.string().min(4).max(100).required(),
    tax_exemption: joi_1.default.number().min(0).max(1).required(),
    primary_purpose: joi_1.default.array().items(joi_1.default.number()).required(),
    affiliations: joi_1.default.string().required(),
});
let AdminController = class AdminController {
    constructor() {
        this.organizationService = new Organization_service_1.OrganizationService();
        this.configService = new Config_service_1.ConfigService();
        this.userService = new User_service_1.UserService();
        this.clientService = new Client_service_1.ClientService();
        this.advocateService = new Advocate_service_1.AdvocateService();
    }
    getOrganizationList(req, res, filter) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const organizations = yield this.organizationService.getOrganizations(filter);
                const customResponse = yield Promise.all(organizations.map((organization) => __awaiter(this, void 0, void 0, function* () {
                    return yield (0, Organization_util_1.getOrganizationsDetails)(organization);
                })));
                return ResponseFormatter_helper_1.ResponseFormatter.successResponse(res, "Organization list", customResponse);
            }
            catch (error) {
                return ResponseFormatter_helper_1.ResponseFormatter.errorResponse(res, error.message || 'An error occurred');
            }
        });
    }
    updateOrganizationDetails(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                if (!req.body) {
                    return ResponseFormatter_helper_1.ResponseFormatter.errorResponse(res, 'Request body is undefined.');
                }
                const { error } = adminOrgEditSchema.validate(req.body);
                if (error) {
                    return ResponseFormatter_helper_1.ResponseFormatter.errorResponse(res, error.details[0].message);
                }
                const user = yield this.userService.updateUser(req.body.organization_id, req.body, req.user.role);
                if (!user)
                    return ResponseFormatter_helper_1.ResponseFormatter.successResponse(res, 'User not updated');
                return ResponseFormatter_helper_1.ResponseFormatter.successResponse(res, 'User updated');
            }
            catch (error) {
                return ResponseFormatter_helper_1.ResponseFormatter.errorResponse(res, error.message || 'An error occurred');
            }
        });
    }
    updateOrganizationStatus(req, res, organization_id) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const organization = yield this.organizationService.updateStatus(organization_id);
                if (!organization)
                    return ResponseFormatter_helper_1.ResponseFormatter.errorResponse(res, 'Not an organization');
                return ResponseFormatter_helper_1.ResponseFormatter.successResponse(res, 'Status updated');
            }
            catch (error) {
                return ResponseFormatter_helper_1.ResponseFormatter.errorResponse(res, error.message || 'An error occurred');
            }
        });
    }
    getOrganizationDetails(req, res, organization_id) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                let customServices = [];
                let customUser = [];
                let roleId;
                const user = req.query.user;
                if (user == "all") {
                    roleId = 0;
                }
                else
                    roleId = (0, Common_util_1.getRoleIdByName)(user);
                console.log("role: ", roleId);
                const checkIfOrganization = yield this.organizationService.checkIfOrganizationIsAvailable(organization_id);
                if (!checkIfOrganization)
                    return ResponseFormatter_helper_1.ResponseFormatter.errorResponse(res, 'Not an organization');
                const organizationDetails = yield (0, Organization_util_1.getOrganizationsDetails)(checkIfOrganization);
                const getServices = yield this.organizationService.getOrganizationServices(organization_id);
                const getUsers = yield this.organizationService.getUserByOrganization(organization_id, roleId);
                for (const user of getUsers) {
                    const data = yield (0, Organization_util_1.getUserDetails)(user);
                    customUser.push(data);
                }
                for (const service of getServices) {
                    const data = yield (0, Organization_util_1.getOrganizationsServiceDetails)(service);
                    customServices.push(data);
                }
                const customResponse = {
                    organization: organizationDetails,
                    services: customServices,
                    users: customUser
                };
                return ResponseFormatter_helper_1.ResponseFormatter.successResponse(res, 'Status updated', customResponse);
            }
            catch (error) {
                return ResponseFormatter_helper_1.ResponseFormatter.errorResponse(res, error.message || 'An error occurred');
            }
        });
    }
    sendInvitation(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                if (!req.body) {
                    return ResponseFormatter_helper_1.ResponseFormatter.errorResponse(res, 'Request body is undefined.');
                }
                const { error } = Organization_schema_1.sendInvitationSchema.validate(req.body);
                if (error) {
                    return ResponseFormatter_helper_1.ResponseFormatter.errorResponse(res, error.details[0].message);
                }
                const { email, role, organization_id } = req.body;
                const checkIfEmailAlreadyInUse = yield this.organizationService.checkIfEmailAlreadyInUse(req.body.email);
                if (checkIfEmailAlreadyInUse)
                    return ResponseFormatter_helper_1.ResponseFormatter.errorResponse(res, "Email already in use!");
                const checkIfOrganization = yield this.organizationService.checkIfOrganization(organization_id);
                if (!checkIfOrganization)
                    return ResponseFormatter_helper_1.ResponseFormatter.errorResponse(res, "Invalid organization");
                const sendUserInvitation = yield this.organizationService.sendInvitation(email, role, organization_id, checkIfOrganization.name);
                if (!sendUserInvitation)
                    return ResponseFormatter_helper_1.ResponseFormatter.errorResponse(res, "Invitation not sent");
                return ResponseFormatter_helper_1.ResponseFormatter.successResponse(res, "Invite successfully sent.  An email has been sent to the registered email ID.");
            }
            catch (error) {
                return ResponseFormatter_helper_1.ResponseFormatter.errorResponse(res, error.message || 'An error occurred');
            }
        });
    }
    resendInvitation(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                if (!req.body) {
                    return ResponseFormatter_helper_1.ResponseFormatter.errorResponse(res, 'Request body is undefined.');
                }
                const { error } = Organization_schema_1.sendInvitationSchema.validate(req.body);
                if (error) {
                    return ResponseFormatter_helper_1.ResponseFormatter.errorResponse(res, error.details[0].message);
                }
                const { email, role, organization_id } = req.body;
                const user = yield this.organizationService.checkIfEmailAlreadyInUse(req.body.email);
                if (!user)
                    return ResponseFormatter_helper_1.ResponseFormatter.errorResponse(res, "Email does not exist");
                if (user.is_active)
                    return ResponseFormatter_helper_1.ResponseFormatter.successResponse(res, "User account already setup");
                const checkIfOrganization = yield this.organizationService.checkIfOrganization(organization_id);
                if (!checkIfOrganization)
                    return ResponseFormatter_helper_1.ResponseFormatter.errorResponse(res, "Invalid organization");
                const sendUserInvitation = yield this.organizationService.resendInvitation(user.id, email, role, organization_id, checkIfOrganization.name);
                if (!sendUserInvitation)
                    return ResponseFormatter_helper_1.ResponseFormatter.errorResponse(res, "Invitation not sent");
                return ResponseFormatter_helper_1.ResponseFormatter.successResponse(res, "Invite successfully resent.  An email has been sent to the registered email ID.");
            }
            catch (error) {
                return ResponseFormatter_helper_1.ResponseFormatter.errorResponse(res, error.message || 'An error occurred');
            }
        });
    }
    getOrganizationUser(req, res, organization_id) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const getUsers = yield this.organizationService.getOrgUsers(organization_id);
                const customResponse = yield Promise.all(getUsers.map((users) => __awaiter(this, void 0, void 0, function* () {
                    return {
                        id: users.id,
                        first_name: users.first_name,
                        last_name: users.last_name,
                        email: users.email,
                        role_id: users.role.id,
                        role_name: users.role.name,
                    };
                })));
                return ResponseFormatter_helper_1.ResponseFormatter.successResponse(res, 'Users found', customResponse);
            }
            catch (error) {
                return ResponseFormatter_helper_1.ResponseFormatter.errorResponse(res, error.message || 'An error occurred');
            }
        });
    }
    getOrganizationUserDetails(req, res, organization_id, user_id) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const checkIfOrganizationUser = yield this.organizationService.checkIfOrganizationUser(user_id, organization_id);
                if (!checkIfOrganizationUser)
                    return ResponseFormatter_helper_1.ResponseFormatter.errorResponse(res, 'User not found in organization');
                const User = yield (0, Organization_util_1.getUserDetails)(checkIfOrganizationUser);
                return ResponseFormatter_helper_1.ResponseFormatter.successResponse(res, 'Users found', User);
            }
            catch (error) {
                return ResponseFormatter_helper_1.ResponseFormatter.errorResponse(res, error.message || 'An error occurred');
            }
        });
    }
    removeUserService(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                if (!req.body) {
                    return ResponseFormatter_helper_1.ResponseFormatter.errorResponse(res, 'Request body is undefined.');
                }
                const { error } = Admin_schema_1.removeUser.validate(req.body);
                if (error) {
                    return ResponseFormatter_helper_1.ResponseFormatter.errorResponse(res, error.details[0].message);
                }
                const { organization_id, user_id, service_id } = req.body;
                const checkIfServiceManager = yield this.organizationService.checkIfOrganizationUser(user_id, organization_id);
                if (!checkIfServiceManager) {
                    return ResponseFormatter_helper_1.ResponseFormatter.errorResponse(res, 'User not found in organization');
                }
                if (checkIfServiceManager.role.id != Constants_helper_1.Constants.ROLE_SERVICE_MANAGER) {
                    return ResponseFormatter_helper_1.ResponseFormatter.errorResponse(res, 'Not a service Manager');
                }
                const checkIfServiceInOrganization = yield this.organizationService.checkIfServiceInOrganization(service_id, organization_id);
                if (!checkIfServiceInOrganization) {
                    return ResponseFormatter_helper_1.ResponseFormatter.errorResponse(res, 'Service not found in organization');
                }
                const checkIfUserInService = yield this.organizationService.checkIfUserInService(user_id, service_id);
                if (!checkIfUserInService) {
                    return ResponseFormatter_helper_1.ResponseFormatter.errorResponse(res, 'User not assigned to this service');
                }
                // const checkIfEmail = await this.organizationService.checkIfEmailIsServiceManager(email, user_id, organization_id);
                // if (!checkIfEmail) {
                //     return ResponseFormatter.errorResponse(res, 'Email provided is not a service manager');
                // }
                const removeUserService = yield this.organizationService.removeUserFromService(user_id, service_id);
                if (!removeUserService) {
                    return ResponseFormatter_helper_1.ResponseFormatter.errorResponse(res, 'Failed to remove user from service');
                }
                return ResponseFormatter_helper_1.ResponseFormatter.successResponse(res, 'Service Removed from user successfully');
            }
            catch (error) {
                return ResponseFormatter_helper_1.ResponseFormatter.errorResponse(res, error.message || 'An error occurred');
            }
        });
    }
    removeClient(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                if (!req.body) {
                    return ResponseFormatter_helper_1.ResponseFormatter.errorResponse(res, 'Request body is undefined.');
                }
                const { error } = Admin_schema_1.removeClient.validate(req.body);
                if (error) {
                    return ResponseFormatter_helper_1.ResponseFormatter.errorResponse(res, error.details[0].message);
                }
                const { organization_id, user_id, client_id, role_id } = req.body;
                const checkIfServiceManager = yield this.organizationService.checkIfOrganizationUser(user_id, organization_id);
                if (!checkIfServiceManager) {
                    return ResponseFormatter_helper_1.ResponseFormatter.errorResponse(res, 'User not found in organization');
                }
                if (checkIfServiceManager.role.id != role_id)
                    return ResponseFormatter_helper_1.ResponseFormatter.errorResponse(res, 'Not a valid user type');
                const checkIfClientCreatedByUser = yield this.organizationService.checkIfClientCreatedByUser(client_id, user_id);
                if (!checkIfClientCreatedByUser) {
                    return ResponseFormatter_helper_1.ResponseFormatter.errorResponse(res, 'Client not created by this user');
                }
                const removeUserClient = yield this.organizationService.removeUserClient(client_id);
                if (!removeUserClient) {
                    return ResponseFormatter_helper_1.ResponseFormatter.errorResponse(res, 'Failed to remove client');
                }
                return ResponseFormatter_helper_1.ResponseFormatter.successResponse(res, 'Service Removed from user successfully');
            }
            catch (error) {
                return ResponseFormatter_helper_1.ResponseFormatter.errorResponse(res, error.message || 'An error occurred');
            }
        });
    }
    //     Remove service manager
    removeServiceManager(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                if (!req.body) {
                    return ResponseFormatter_helper_1.ResponseFormatter.errorResponse(res, 'Request body is undefined.');
                }
                const { error } = Services_schema_1.removeUserSchema.validate(req.body);
                if (error) {
                    return ResponseFormatter_helper_1.ResponseFormatter.errorResponse(res, error.details[0].message);
                }
                const { organization_id, user_id, email } = req.body;
                yield (0, Organization_util_1.removeOrganizationUser)(organization_id, user_id, email, req.user.id, Constants_helper_1.Constants.ROLE_SERVICE_MANAGER);
                return ResponseFormatter_helper_1.ResponseFormatter.successResponse(res, 'Service manager deleted');
            }
            catch (error) {
                return ResponseFormatter_helper_1.ResponseFormatter.errorResponse(res, error.message || 'An error occurred');
            }
        });
    }
    //     Remove advocate
    removeAdvocate(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                if (!req.body) {
                    return ResponseFormatter_helper_1.ResponseFormatter.errorResponse(res, 'Request body is undefined.');
                }
                const { error } = Services_schema_1.removeUserSchema.validate(req.body);
                if (error) {
                    return ResponseFormatter_helper_1.ResponseFormatter.errorResponse(res, error.details[0].message);
                }
                const { organization_id, user_id, email } = req.body;
                yield (0, Organization_util_1.removeOrganizationUser)(organization_id, user_id, email, req.user.id, Constants_helper_1.Constants.ROLE_SERVICE_MANAGER);
                return ResponseFormatter_helper_1.ResponseFormatter.successResponse(res, 'Advocate deleted');
            }
            catch (error) {
                return ResponseFormatter_helper_1.ResponseFormatter.errorResponse(res, error.message || 'An error occurred');
            }
        });
    }
    //     Remove org admin
    removeOrganizationAdmin(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                if (!req.body) {
                    return ResponseFormatter_helper_1.ResponseFormatter.errorResponse(res, 'Request body is undefined.');
                }
                const { error } = Services_schema_1.removeUserSchema.validate(req.body);
                if (error) {
                    return ResponseFormatter_helper_1.ResponseFormatter.errorResponse(res, error.details[0].message);
                }
                const { organization_id, user_id, email } = req.body;
                yield (0, Organization_util_1.removeOrganizationUser)(organization_id, user_id, email, req.user.id, Constants_helper_1.Constants.ROLE_ORGANIZATION_ADMIN);
                return ResponseFormatter_helper_1.ResponseFormatter.successResponse(res, 'Organization admin deleted');
            }
            catch (error) {
                return ResponseFormatter_helper_1.ResponseFormatter.errorResponse(res, error.message || 'An error occurred');
            }
        });
    }
    addOrganization(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                if (!req.body) {
                    return ResponseFormatter_helper_1.ResponseFormatter.errorResponse(res, 'Request body is undefined.');
                }
                const { error } = Services_schema_1.servicesSchema.validate(req.body);
                if (error) {
                    return ResponseFormatter_helper_1.ResponseFormatter.errorResponse(res, error.details[0].message);
                }
                if (req.body.id) {
                    const checkIfValidOrganization = yield this.organizationService.checkIfValidOrganization(req.body.id, req.body.organization_id);
                    if (!checkIfValidOrganization)
                        return ResponseFormatter_helper_1.ResponseFormatter.errorResponse(res, 'Invalid service');
                    const settings = yield this.organizationService.editServiceDetails(req.body.id, req.body.organization_id, req.user.role, req.body);
                    if (!settings)
                        return ResponseFormatter_helper_1.ResponseFormatter.errorResponse(res, "Can't edit, try again later");
                    return ResponseFormatter_helper_1.ResponseFormatter.successResponse(res, "Successfully updated service settings.");
                }
                else {
                    const settings = yield this.organizationService.addServiceDetails(req.body.organization_id, req.user.role, req.body, req.user.id);
                    if (!settings)
                        return ResponseFormatter_helper_1.ResponseFormatter.errorResponse(res, "Can't add, try again later");
                    return ResponseFormatter_helper_1.ResponseFormatter.successResponse(res, "Successfully added service.");
                }
            }
            catch (error) {
                return ResponseFormatter_helper_1.ResponseFormatter.errorResponse(res, error.message || 'An error occurred');
            }
        });
    }
    serviceDelete(req, res, organizationId, serviceId) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const checkValidService = yield this.organizationService.checkIfValidOrganization(serviceId, organizationId);
                if (!checkValidService)
                    return ResponseFormatter_helper_1.ResponseFormatter.errorResponse(res, "Not a valid service");
                // remove assigned service
                const removeAssignedService = yield this.organizationService.removeAssignedService(serviceId);
                if (!removeAssignedService)
                    return ResponseFormatter_helper_1.ResponseFormatter.errorResponse(res, "Can't remove assigned service, try again later");
                // remove service settings
                const removeServiceSettings = yield this.organizationService.removeServiceSettings(serviceId);
                if (!removeServiceSettings)
                    return ResponseFormatter_helper_1.ResponseFormatter.errorResponse(res, "Can't remove service settings, try again later");
                // remove service
                const removeService = yield this.organizationService.removeService(serviceId);
                if (!removeService)
                    return ResponseFormatter_helper_1.ResponseFormatter.errorResponse(res, "Can't remove service, try again later");
                return ResponseFormatter_helper_1.ResponseFormatter.successResponse(res, "Successful");
            }
            catch (error) {
                return ResponseFormatter_helper_1.ResponseFormatter.errorResponse(res, error.message || 'An error occurred');
            }
        });
    }
    getOrganizations(req, res, organizationId) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                let customResponse = [];
                const getOrganizationServices = yield this.organizationService.getOrganizationsService(organizationId);
                for (const service of getOrganizationServices) {
                    const data = yield (0, Organization_util_1.getOrganizationsServiceDetails)(service);
                    customResponse.push(data);
                }
                return ResponseFormatter_helper_1.ResponseFormatter.successResponse(res, "Successful", customResponse);
            }
            catch (error) {
                return ResponseFormatter_helper_1.ResponseFormatter.errorResponse(res, error.message || 'An error occurred');
            }
        });
    }
    getOrganizationsById(req, res, serviceId, organizationId) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const checkValidService = yield this.organizationService.checkIfValidOrganization(serviceId, organizationId);
                if (!checkValidService)
                    return ResponseFormatter_helper_1.ResponseFormatter.errorResponse(res, "Not a valid service");
                const getOrganizationServices = yield this.organizationService.getOrganizationsServiceById(serviceId);
                const customResponse = yield (0, Organization_util_1.getOrganizationsServiceDetails)(getOrganizationServices);
                return ResponseFormatter_helper_1.ResponseFormatter.successResponse(res, "Successful", customResponse);
            }
            catch (error) {
                return ResponseFormatter_helper_1.ResponseFormatter.errorResponse(res, error.message || 'An error occurred');
            }
        });
    }
    addServiceSettings(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                if (!req.body) {
                    return ResponseFormatter_helper_1.ResponseFormatter.errorResponse(res, 'Request body is undefined.');
                }
                const { error } = Organization_schema_1.serviceSettingsSchema.validate(req.body);
                if (error) {
                    return ResponseFormatter_helper_1.ResponseFormatter.errorResponse(res, error.details[0].message);
                }
                const checkIfValidService = yield this.organizationService.checkIfValidOrganization(req.body.service_id, req.body.organization_id);
                if (!checkIfValidService)
                    return ResponseFormatter_helper_1.ResponseFormatter.errorResponse(res, "Not a valid service");
                const checkIfServiceSettings = yield this.organizationService.checkIfServiceExists(req.body.service_id);
                if (!checkIfServiceSettings)
                    return ResponseFormatter_helper_1.ResponseFormatter.errorResponse(res, "Service not found");
                else if (checkIfServiceSettings) {
                    const editServiceSettings = yield this.organizationService.editServiceSettings(req.body);
                    if (!editServiceSettings)
                        return ResponseFormatter_helper_1.ResponseFormatter.errorResponse(res, "Can't edit, try again later");
                    return ResponseFormatter_helper_1.ResponseFormatter.successResponse(res, "Successfully updated service settings.");
                }
            }
            catch (error) {
                return ResponseFormatter_helper_1.ResponseFormatter.errorResponse(res, error.message || 'An error occurred');
            }
        });
    }
    getServiceSettings(req, res, serviceId, organizationId) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const checkIfValidService = yield this.organizationService.checkIfValidOrganization(serviceId, organizationId);
                if (!checkIfValidService)
                    return ResponseFormatter_helper_1.ResponseFormatter.errorResponse(res, "Not a valid service");
                const getServiceSettings = yield this.organizationService.getServiceSettingsById(serviceId);
                if (!getServiceSettings)
                    return ResponseFormatter_helper_1.ResponseFormatter.errorResponse(res, "No service settings found");
                const getEmailReminders = yield this.organizationService.getEmailRemindersByServiceId(serviceId);
                const customResponse = {
                    service_id: getServiceSettings.id,
                    available_slots: getServiceSettings.slots_available,
                    service_manager: yield this.organizationService.getServiceManager(getServiceSettings.service_manager),
                    contact_email: getServiceSettings.contact_email,
                    contact_phone: getServiceSettings.contact_phone,
                    emailReminders: getEmailReminders.map((reminder) => {
                        return ({
                            id: reminder.id,
                            email: reminder.email,
                            day_of_week: reminder.day_of_week.map((day) => {
                                return {
                                    id: day,
                                    name: EmailReminder_entity_1.DaysOfWeek[parseInt(day)]
                                };
                            }),
                            time: reminder.time,
                            time_zone_id: reminder.time_zone,
                            time_zone: EmailReminder_entity_1.TimeZone[reminder.time_zone]
                        });
                    })
                };
                return ResponseFormatter_helper_1.ResponseFormatter.successResponse(res, "Service settings", customResponse);
            }
            catch (error) {
                return ResponseFormatter_helper_1.ResponseFormatter.errorResponse(res, error.message || 'An error occurred');
            }
        });
    }
    getServiceRequest(req, res, organizationId) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const page_number = parseInt(req.query.page_number) || Constants_helper_1.Constants.PAGE_NUMBER;
                const page_size = parseInt(req.query.page_size) || Constants_helper_1.Constants.PAGE_SIZE;
                const status = parseInt(req.query.status);
                const getServiceRequestsData = yield (0, Organization_util_1.getServiceRequests)(organizationId, page_number, page_size, status);
                return ResponseFormatter_helper_1.ResponseFormatter.successResponse(res, "Successful", getServiceRequestsData);
            }
            catch (error) {
                return ResponseFormatter_helper_1.ResponseFormatter.errorResponse(res, error.message || 'An error occurred');
            }
        });
    }
    getServiceRequestsId(req, res, organizationId, serviceRequestsId) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const checkIfServiceRequest = yield this.organizationService.checkIfServiceRequestExists(organizationId, serviceRequestsId);
                if (!checkIfServiceRequest)
                    return ResponseFormatter_helper_1.ResponseFormatter.errorResponse(res, "Not a valid service request");
                const customResponse = yield (0, Organization_util_1.getServiceRequestDetails)(serviceRequestsId);
                return ResponseFormatter_helper_1.ResponseFormatter.successResponse(res, "Successful", customResponse);
            }
            catch (error) {
                return ResponseFormatter_helper_1.ResponseFormatter.errorResponse(res, error.message || 'An error occurred');
            }
        });
    }
    reportUser(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                if (!req.body) {
                    return ResponseFormatter_helper_1.ResponseFormatter.errorResponse(res, 'Request body is undefined.');
                }
                const { error } = Organization_schema_1.reportSchema.validate(req.body);
                if (error) {
                    return ResponseFormatter_helper_1.ResponseFormatter.errorResponse(res, error.details[0].message);
                }
                yield (0, Common_util_2.reportUser)(req.body, req.user.id, req.body.organization_id);
                return ResponseFormatter_helper_1.ResponseFormatter.successResponse(res, 'Users reported');
            }
            catch (error) {
                return ResponseFormatter_helper_1.ResponseFormatter.errorResponse(res, error.message || 'An error occurred');
            }
        });
    }
    changeServiceRequestStatus(req, res, organizationId, serviceRequestsId, status) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const checkIfServiceRequest = yield this.organizationService.checkIfServiceRequestExists(organizationId, serviceRequestsId);
                if (!checkIfServiceRequest)
                    return ResponseFormatter_helper_1.ResponseFormatter.errorResponse(res, "Not a valid service request");
                const getServiceRequest = yield this.clientService.getServiceRequestById(serviceRequestsId);
                if (!getServiceRequest) {
                    return ResponseFormatter_helper_1.ResponseFormatter.errorResponse(res, "Service request not found");
                }
                const updatedAssignedServiceStatus = yield this.clientService.updateServiceRequestStatus(serviceRequestsId, status);
                if (!updatedAssignedServiceStatus)
                    return ResponseFormatter_helper_1.ResponseFormatter.errorResponse(res, "Failed to update service request status");
                return ResponseFormatter_helper_1.ResponseFormatter.successResponse(res, "Successfully updated service request status");
            }
            catch (error) {
                return ResponseFormatter_helper_1.ResponseFormatter.errorResponse(res, error.message || 'An error occurred');
            }
        });
    }
    addClient(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                if (!req.body) {
                    return ResponseFormatter_helper_1.ResponseFormatter.errorResponse(res, 'Request body is undefined.');
                }
                const { error } = Client_schema_1.clientSchema.validate(req.body);
                if (error) {
                    return ResponseFormatter_helper_1.ResponseFormatter.errorResponse(res, error.details[0].message);
                }
                const addEditClient = yield (0, ServiceRequest_util_1.clients)(req.body, req.user.id, req.body.organization_id);
                return ResponseFormatter_helper_1.ResponseFormatter.successResponse(res, `${addEditClient}`);
            }
            catch (error) {
                return ResponseFormatter_helper_1.ResponseFormatter.errorResponse(res, error.message || 'An error occurred');
            }
        });
    }
    getClients(req, res, organizationId) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const getClients = yield this.organizationService.getClientsByOrganization(organizationId);
                const customResponse = yield (0, Advocate_util_1.getClientDetails)(getClients, Constants_helper_1.Constants.ROLE_ADVOCATE);
                return ResponseFormatter_helper_1.ResponseFormatter.successResponse(res, "Successful", customResponse);
            }
            catch (error) {
                return ResponseFormatter_helper_1.ResponseFormatter.errorResponse(res, error.message || 'An error occurred');
            }
        });
    }
    getClientsById(req, res, organizationId, clientId) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const checkIfOrganizationClientExists = yield this.organizationService.checkIfOrganizationClientExists(organizationId, clientId);
                if (!checkIfOrganizationClientExists) {
                    return ResponseFormatter_helper_1.ResponseFormatter.errorResponse(res, "Not a valid client");
                }
                const customResponse = yield (0, ServiceRequest_util_1.getClientsById)(clientId, req.user.id, organizationId);
                return ResponseFormatter_helper_1.ResponseFormatter.successResponse(res, "Successful", customResponse);
            }
            catch (error) {
                return ResponseFormatter_helper_1.ResponseFormatter.errorResponse(res, error.message || 'An error occurred');
            }
        });
    }
    //
    addClientService(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                if (!req.body) {
                    return ResponseFormatter_helper_1.ResponseFormatter.errorResponse(res, 'Request body is undefined.');
                }
                const { error } = Services_schema_1.clientServiceSchema.validate(req.body);
                if (error) {
                    return ResponseFormatter_helper_1.ResponseFormatter.errorResponse(res, error.details[0].message);
                }
                yield (0, Common_util_3.addClientService)(req.body, req.user.role.id);
                return ResponseFormatter_helper_1.ResponseFormatter.successResponse(res, "Successful");
            }
            catch (error) {
                return ResponseFormatter_helper_1.ResponseFormatter.errorResponse(res, error.message || 'An error occurred');
            }
        });
    }
};
exports.AdminController = AdminController;
__decorate([
    (0, routing_controllers_1.Get)("/organization/list/:filter"),
    (0, routing_controllers_1.UseBefore)(Auth_middleware_1.authMiddleware),
    (0, routing_controllers_1.UseBefore)(Admin_middleware_1.adminMiddleware),
    __param(0, (0, routing_controllers_1.Req)()),
    __param(1, (0, routing_controllers_1.Res)()),
    __param(2, (0, routing_controllers_1.Param)("filter")),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object, String]),
    __metadata("design:returntype", Promise)
], AdminController.prototype, "getOrganizationList", null);
__decorate([
    (0, routing_controllers_1.Post)("/organization/edit"),
    (0, routing_controllers_1.UseBefore)(Auth_middleware_1.authMiddleware),
    (0, routing_controllers_1.UseBefore)(Admin_middleware_1.adminMiddleware),
    (0, routing_controllers_1.UseBefore)(MulterConfig_helper_1.upload.array("affiliation_files", 10)),
    __param(0, (0, routing_controllers_1.Req)()),
    __param(1, (0, routing_controllers_1.Res)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], AdminController.prototype, "updateOrganizationDetails", null);
__decorate([
    (0, routing_controllers_1.Patch)("/organization/status/:organization_id"),
    (0, routing_controllers_1.UseBefore)(Auth_middleware_1.authMiddleware),
    (0, routing_controllers_1.UseBefore)(Admin_middleware_1.adminMiddleware),
    __param(0, (0, routing_controllers_1.Req)()),
    __param(1, (0, routing_controllers_1.Res)()),
    __param(2, (0, routing_controllers_1.Param)("organization_id")),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object, Number]),
    __metadata("design:returntype", Promise)
], AdminController.prototype, "updateOrganizationStatus", null);
__decorate([
    (0, routing_controllers_1.Get)("/organization/:organization_id"),
    (0, routing_controllers_1.UseBefore)(Auth_middleware_1.authMiddleware),
    (0, routing_controllers_1.UseBefore)(Admin_middleware_1.adminMiddleware),
    __param(0, (0, routing_controllers_1.Req)()),
    __param(1, (0, routing_controllers_1.Res)()),
    __param(2, (0, routing_controllers_1.Param)("organization_id")),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object, Number]),
    __metadata("design:returntype", Promise)
], AdminController.prototype, "getOrganizationDetails", null);
__decorate([
    (0, routing_controllers_1.Post)("/user-invitation"),
    (0, routing_controllers_1.UseBefore)(Auth_middleware_1.authMiddleware),
    (0, routing_controllers_1.UseBefore)(Admin_middleware_1.adminMiddleware),
    __param(0, (0, routing_controllers_1.Req)()),
    __param(1, (0, routing_controllers_1.Res)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], AdminController.prototype, "sendInvitation", null);
__decorate([
    (0, routing_controllers_1.Post)("/user-invitation-resend"),
    (0, routing_controllers_1.UseBefore)(Auth_middleware_1.authMiddleware),
    (0, routing_controllers_1.UseBefore)(Admin_middleware_1.adminMiddleware),
    __param(0, (0, routing_controllers_1.Req)()),
    __param(1, (0, routing_controllers_1.Res)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], AdminController.prototype, "resendInvitation", null);
__decorate([
    (0, routing_controllers_1.Get)("/organization/users/:organizationId"),
    (0, routing_controllers_1.UseBefore)(Auth_middleware_1.authMiddleware),
    (0, routing_controllers_1.UseBefore)(Admin_middleware_1.adminMiddleware),
    __param(0, (0, routing_controllers_1.Req)()),
    __param(1, (0, routing_controllers_1.Res)()),
    __param(2, (0, routing_controllers_1.Param)("organizationId")),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object, Number]),
    __metadata("design:returntype", Promise)
], AdminController.prototype, "getOrganizationUser", null);
__decorate([
    (0, routing_controllers_1.Get)("/organization/user-details/:organizationId/:userId"),
    (0, routing_controllers_1.UseBefore)(Auth_middleware_1.authMiddleware),
    (0, routing_controllers_1.UseBefore)(Admin_middleware_1.adminMiddleware),
    __param(0, (0, routing_controllers_1.Req)()),
    __param(1, (0, routing_controllers_1.Res)()),
    __param(2, (0, routing_controllers_1.Param)("organizationId")),
    __param(3, (0, routing_controllers_1.Param)("userId")),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object, Number, Number]),
    __metadata("design:returntype", Promise)
], AdminController.prototype, "getOrganizationUserDetails", null);
__decorate([
    (0, routing_controllers_1.Post)("/organization/remove-user-service"),
    (0, routing_controllers_1.UseBefore)(Auth_middleware_1.authMiddleware),
    (0, routing_controllers_1.UseBefore)(Admin_middleware_1.adminMiddleware),
    __param(0, (0, routing_controllers_1.Req)()),
    __param(1, (0, routing_controllers_1.Res)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], AdminController.prototype, "removeUserService", null);
__decorate([
    (0, routing_controllers_1.Post)("/organization/remove-client"),
    (0, routing_controllers_1.UseBefore)(Auth_middleware_1.authMiddleware),
    (0, routing_controllers_1.UseBefore)(Admin_middleware_1.adminMiddleware),
    __param(0, (0, routing_controllers_1.Req)()),
    __param(1, (0, routing_controllers_1.Res)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], AdminController.prototype, "removeClient", null);
__decorate([
    (0, routing_controllers_1.Post)("/organization/remove/service-manager"),
    (0, routing_controllers_1.UseBefore)(Auth_middleware_1.authMiddleware),
    (0, routing_controllers_1.UseBefore)(Admin_middleware_1.adminMiddleware),
    __param(0, (0, routing_controllers_1.Req)()),
    __param(1, (0, routing_controllers_1.Res)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], AdminController.prototype, "removeServiceManager", null);
__decorate([
    (0, routing_controllers_1.Post)("/organization/remove/advocate"),
    (0, routing_controllers_1.UseBefore)(Auth_middleware_1.authMiddleware),
    (0, routing_controllers_1.UseBefore)(Admin_middleware_1.adminMiddleware),
    __param(0, (0, routing_controllers_1.Req)()),
    __param(1, (0, routing_controllers_1.Res)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], AdminController.prototype, "removeAdvocate", null);
__decorate([
    (0, routing_controllers_1.Post)("/organization/remove/organization-admin"),
    (0, routing_controllers_1.UseBefore)(Auth_middleware_1.authMiddleware),
    (0, routing_controllers_1.UseBefore)(Admin_middleware_1.adminMiddleware),
    __param(0, (0, routing_controllers_1.Req)()),
    __param(1, (0, routing_controllers_1.Res)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], AdminController.prototype, "removeOrganizationAdmin", null);
__decorate([
    (0, routing_controllers_1.Post)("/organization/services"),
    (0, routing_controllers_1.UseBefore)(Auth_middleware_1.authMiddleware),
    (0, routing_controllers_1.UseBefore)(Admin_middleware_1.adminMiddleware),
    __param(0, (0, routing_controllers_1.Req)()),
    __param(1, (0, routing_controllers_1.Res)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], AdminController.prototype, "addOrganization", null);
__decorate([
    (0, routing_controllers_1.Delete)("/organization/service-delete/:organizationId/:serviceId"),
    (0, routing_controllers_1.UseBefore)(Auth_middleware_1.authMiddleware),
    (0, routing_controllers_1.UseBefore)(Organization_middleware_1.organizationMiddleware),
    __param(0, (0, routing_controllers_1.Req)()),
    __param(1, (0, routing_controllers_1.Res)()),
    __param(2, (0, routing_controllers_1.Param)("organizationId")),
    __param(3, (0, routing_controllers_1.Param)("serviceId")),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object, Number, Number]),
    __metadata("design:returntype", Promise)
], AdminController.prototype, "serviceDelete", null);
__decorate([
    (0, routing_controllers_1.Get)("/organization/services/:organizationId"),
    (0, routing_controllers_1.UseBefore)(Auth_middleware_1.authMiddleware),
    (0, routing_controllers_1.UseBefore)(Admin_middleware_1.adminMiddleware),
    __param(0, (0, routing_controllers_1.Req)()),
    __param(1, (0, routing_controllers_1.Res)()),
    __param(2, (0, routing_controllers_1.Param)("organizationId")),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object, Number]),
    __metadata("design:returntype", Promise)
], AdminController.prototype, "getOrganizations", null);
__decorate([
    (0, routing_controllers_1.Get)("/organization/services/:organizationId/:serviceId"),
    (0, routing_controllers_1.UseBefore)(Auth_middleware_1.authMiddleware),
    (0, routing_controllers_1.UseBefore)(Admin_middleware_1.adminMiddleware),
    __param(0, (0, routing_controllers_1.Req)()),
    __param(1, (0, routing_controllers_1.Res)()),
    __param(2, (0, routing_controllers_1.Param)("serviceId")),
    __param(3, (0, routing_controllers_1.Param)("organizationId")),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object, Number, Number]),
    __metadata("design:returntype", Promise)
], AdminController.prototype, "getOrganizationsById", null);
__decorate([
    (0, routing_controllers_1.Post)("/organization/services-settings"),
    (0, routing_controllers_1.UseBefore)(Auth_middleware_1.authMiddleware),
    (0, routing_controllers_1.UseBefore)(Admin_middleware_1.adminMiddleware),
    __param(0, (0, routing_controllers_1.Req)()),
    __param(1, (0, routing_controllers_1.Res)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], AdminController.prototype, "addServiceSettings", null);
__decorate([
    (0, routing_controllers_1.Get)("/organization/services-settings/:organizationId/:serviceId"),
    (0, routing_controllers_1.UseBefore)(Auth_middleware_1.authMiddleware),
    (0, routing_controllers_1.UseBefore)(Admin_middleware_1.adminMiddleware),
    __param(0, (0, routing_controllers_1.Req)()),
    __param(1, (0, routing_controllers_1.Res)()),
    __param(2, (0, routing_controllers_1.Param)("serviceId")),
    __param(3, (0, routing_controllers_1.Param)("organizationId")),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object, Number, Number]),
    __metadata("design:returntype", Promise)
], AdminController.prototype, "getServiceSettings", null);
__decorate([
    (0, routing_controllers_1.Get)("/organization/service-requests/:organizationId"),
    (0, routing_controllers_1.UseBefore)(Auth_middleware_1.authMiddleware),
    (0, routing_controllers_1.UseBefore)(Admin_middleware_1.adminMiddleware),
    __param(0, (0, routing_controllers_1.Req)()),
    __param(1, (0, routing_controllers_1.Res)()),
    __param(2, (0, routing_controllers_1.Param)("organizationId")),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object, Number]),
    __metadata("design:returntype", Promise)
], AdminController.prototype, "getServiceRequest", null);
__decorate([
    (0, routing_controllers_1.Get)("/organization/service-requests/:organizationId/:serviceRequestsId"),
    (0, routing_controllers_1.UseBefore)(Auth_middleware_1.authMiddleware),
    (0, routing_controllers_1.UseBefore)(Admin_middleware_1.adminMiddleware),
    __param(0, (0, routing_controllers_1.Req)()),
    __param(1, (0, routing_controllers_1.Res)()),
    __param(2, (0, routing_controllers_1.Param)("organizationId")),
    __param(3, (0, routing_controllers_1.Param)("serviceRequestsId")),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object, Number, Number]),
    __metadata("design:returntype", Promise)
], AdminController.prototype, "getServiceRequestsId", null);
__decorate([
    (0, routing_controllers_1.Post)("/organization/report-user"),
    (0, routing_controllers_1.UseBefore)(Auth_middleware_1.authMiddleware),
    (0, routing_controllers_1.UseBefore)(Admin_middleware_1.adminMiddleware),
    __param(0, (0, routing_controllers_1.Req)()),
    __param(1, (0, routing_controllers_1.Res)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], AdminController.prototype, "reportUser", null);
__decorate([
    (0, routing_controllers_1.Patch)("/organization/service-requests/:organizationId/:serviceRequestsId/:status"),
    (0, routing_controllers_1.UseBefore)(Auth_middleware_1.authMiddleware),
    (0, routing_controllers_1.UseBefore)(Admin_middleware_1.adminMiddleware),
    __param(0, (0, routing_controllers_1.Req)()),
    __param(1, (0, routing_controllers_1.Res)()),
    __param(2, (0, routing_controllers_1.Param)("organizationId")),
    __param(3, (0, routing_controllers_1.Param)("serviceRequestsId")),
    __param(4, (0, routing_controllers_1.Param)("status")),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object, Number, Number, Number]),
    __metadata("design:returntype", Promise)
], AdminController.prototype, "changeServiceRequestStatus", null);
__decorate([
    (0, routing_controllers_1.Post)("/organization/clients"),
    (0, routing_controllers_1.UseBefore)(Auth_middleware_1.authMiddleware),
    (0, routing_controllers_1.UseBefore)(Admin_middleware_1.adminMiddleware),
    __param(0, (0, routing_controllers_1.Req)()),
    __param(1, (0, routing_controllers_1.Res)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], AdminController.prototype, "addClient", null);
__decorate([
    (0, routing_controllers_1.Get)("/organization/clients/:organizationId"),
    (0, routing_controllers_1.UseBefore)(Auth_middleware_1.authMiddleware),
    (0, routing_controllers_1.UseBefore)(Admin_middleware_1.adminMiddleware),
    __param(0, (0, routing_controllers_1.Req)()),
    __param(1, (0, routing_controllers_1.Res)()),
    __param(2, (0, routing_controllers_1.Param)("organizationId")),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object, Number]),
    __metadata("design:returntype", Promise)
], AdminController.prototype, "getClients", null);
__decorate([
    (0, routing_controllers_1.Get)("/organization/clients/:organizationId/:clientId"),
    (0, routing_controllers_1.UseBefore)(Auth_middleware_1.authMiddleware),
    (0, routing_controllers_1.UseBefore)(Admin_middleware_1.adminMiddleware),
    __param(0, (0, routing_controllers_1.Req)()),
    __param(1, (0, routing_controllers_1.Res)()),
    __param(2, (0, routing_controllers_1.Param)("organizationId")),
    __param(3, (0, routing_controllers_1.Param)("clientId")),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object, Number, Number]),
    __metadata("design:returntype", Promise)
], AdminController.prototype, "getClientsById", null);
__decorate([
    (0, routing_controllers_1.Post)("/organization/service-request/add"),
    (0, routing_controllers_1.UseBefore)(Auth_middleware_1.authMiddleware),
    (0, routing_controllers_1.UseBefore)(Organization_middleware_1.organizationMiddleware),
    __param(0, (0, routing_controllers_1.Req)()),
    __param(1, (0, routing_controllers_1.Res)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], AdminController.prototype, "addClientService", null);
exports.AdminController = AdminController = __decorate([
    (0, routing_controllers_1.JsonController)("/api/admin")
], AdminController);
