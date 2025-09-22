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
exports.AuthController = void 0;
const routing_controllers_1 = require("routing-controllers");
const User_service_1 = require("../services/User.service");
const Organization_service_1 = require("../services/Organization.service");
const Auth_middleware_1 = require("../middleware/Auth.middleware");
const ResponseFormatter_helper_1 = require("../helper/ResponseFormatter.helper");
const joi_1 = __importDefault(require("joi"));
const Organization_middleware_1 = require("../middleware/Organization.middleware");
const Organization_util_1 = require("../util/Organization.util");
const MulterConfig_helper_1 = require("../helper/MulterConfig.helper");
const Services_schema_1 = require("../schema/Services.schema");
const EmailReminder_entity_1 = require("../entity/EmailReminder.entity");
const Constants_helper_1 = require("../helper/Constants.helper");
const Advocate_util_1 = require("../util/Advocate.util");
const Client_service_1 = require("../services/Client.service");
const Advocate_service_1 = require("../services/Advocate.service");
const Client_schema_1 = require("../schema/Client.schema");
const Common_util_1 = require("../util/Common.util");
const Organization_schema_1 = require("../schema/Organization.schema");
const ServiceRequest_util_1 = require("../util/ServiceRequest.util");
const Admin_middleware_1 = require("../middleware/Admin.middleware");
const organizationEditSchema = joi_1.default.object({
    country_code: joi_1.default.string().min(2).max(5).required(),
    phone_no: joi_1.default.string().pattern(/^\d+$/).min(6).max(16).required(),
    street: joi_1.default.string().min(3).max(1600).required(),
    address: joi_1.default.string().min(3).max(1600).required(),
    state: joi_1.default.number().required(),
    city: joi_1.default.string().min(3).max(100).required(),
    disclose_address: joi_1.default.boolean().required(),
    zipcode: joi_1.default.string().min(4).max(10).required(),
    year: joi_1.default.string().min(4).max(5).required(),
    website: joi_1.default.string().min(4).max(100).required(),
    tax_exemption: joi_1.default.number().min(0).max(1).required(),
    primary_purpose: joi_1.default.array().items(joi_1.default.number()).required(),
    affiliations: joi_1.default.string().required(),
});
let AuthController = class AuthController {
    constructor() {
        this.userService = new User_service_1.UserService();
        this.organizationService = new Organization_service_1.OrganizationService();
        this.clientService = new Client_service_1.ClientService();
        this.advocateService = new Advocate_service_1.AdvocateService();
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
                    const checkIfValidOrganization = yield this.organizationService.checkIfValidOrganization(req.body.id, req.user.organization_id);
                    if (!checkIfValidOrganization)
                        return ResponseFormatter_helper_1.ResponseFormatter.errorResponse(res, 'Invalid service');
                    const settings = yield this.organizationService.editServiceDetails(req.body.id, req.user.organization_id, req.user.role, req.body);
                    if (!settings)
                        return ResponseFormatter_helper_1.ResponseFormatter.errorResponse(res, "Can't edit, try again later");
                    return ResponseFormatter_helper_1.ResponseFormatter.successResponse(res, "Successfully updated service.");
                }
                else {
                    const settings = yield this.organizationService.addServiceDetails(req.user.organization_id, req.user.role, req.body, req.user.id);
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
    getOrganizations(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                let customResponse = [];
                const getOrganizationServices = yield this.organizationService.getOrganizationsService(req.user.organization_id);
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
    getOrganizationsById(req, res, serviceId) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const checkValidService = yield this.organizationService.checkIfValidOrganization(serviceId, req.user.organization_id);
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
    serviceDelete(req, res, serviceId) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const checkValidService = yield this.organizationService.checkIfValidOrganization(serviceId, req.user.organization_id);
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
                const checkIfValidService = yield this.organizationService.checkIfValidOrganization(req.body.service_id, req.user.organization_id);
                if (!checkIfValidService)
                    return ResponseFormatter_helper_1.ResponseFormatter.errorResponse(res, "Not a valid service");
                const checkIfService = yield this.organizationService.checkIfServiceExists(req.body.service_id);
                if (!checkIfService)
                    return ResponseFormatter_helper_1.ResponseFormatter.errorResponse(res, "Service not found");
                else if (checkIfService) {
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
    getServiceSettings(req, res, serviceId) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const checkIfValidService = yield this.organizationService.checkIfValidOrganization(serviceId, req.user.organization_id);
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
    getOrganizationList(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const organization = yield this.organizationService.getOrganizationsById(req.user.organization_id);
                const customResponse = yield (0, Organization_util_1.getOrganizationsDetails)(organization);
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
                const { error } = organizationEditSchema.validate(req.body);
                if (error) {
                    return ResponseFormatter_helper_1.ResponseFormatter.errorResponse(res, error.details[0].message);
                }
                const user = yield this.userService.updateUser(req.user.organization_id, req.body, req.user.role);
                if (!user)
                    return ResponseFormatter_helper_1.ResponseFormatter.successResponse(res, 'User not updated');
                return ResponseFormatter_helper_1.ResponseFormatter.successResponse(res, 'User updated');
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
                const { email, role } = req.body;
                const checkIfEmailAlreadyInUse = yield this.organizationService.checkIfEmailAlreadyInUse(req.body.email);
                if (checkIfEmailAlreadyInUse)
                    return ResponseFormatter_helper_1.ResponseFormatter.errorResponse(res, "Email already in use!");
                const sendUserInvitation = yield this.organizationService.sendInvitation(email, role, req.user.organization_id, req.user.organization_name);
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
                const { email, role } = req.body;
                const user = yield this.organizationService.checkIfEmailAlreadyInUse(req.body.email);
                if (!user)
                    return ResponseFormatter_helper_1.ResponseFormatter.errorResponse(res, "Email does not exist");
                if (user.is_active)
                    return ResponseFormatter_helper_1.ResponseFormatter.successResponse(res, "User account already setup");
                const sendUserInvitation = yield this.organizationService.resendInvitation(user.id, email, role, req.user.organization_id, req.user.organization_name);
                if (!sendUserInvitation)
                    return ResponseFormatter_helper_1.ResponseFormatter.errorResponse(res, "Invitation not sent");
                return ResponseFormatter_helper_1.ResponseFormatter.successResponse(res, "Invite successfully resent.  An email has been sent to the registered email ID.");
            }
            catch (error) {
                return ResponseFormatter_helper_1.ResponseFormatter.errorResponse(res, error.message || 'An error occurred');
            }
        });
    }
    getOrganizationUser(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const getUsers = yield this.organizationService.getOrgUsers(req.user.organization_id);
                const customResponse = yield Promise.all(getUsers.map((users) => __awaiter(this, void 0, void 0, function* () {
                    return {
                        id: users.id,
                        first_name: users.first_name,
                        last_name: users.last_name,
                        email: users.email,
                        role_id: users.role.id,
                        role_name: users.role.name == 'organization' ? 'Organization Admin' : users.role.name == 'service_manager' ? 'Service Manager' : users.role.name == 'advocate' ? 'Advocate' : users.role.name,
                    };
                })));
                return ResponseFormatter_helper_1.ResponseFormatter.successResponse(res, 'Users found', customResponse);
            }
            catch (error) {
                return ResponseFormatter_helper_1.ResponseFormatter.errorResponse(res, error.message || 'An error occurred');
            }
        });
    }
    getServiceRequest(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const page_number = parseInt(req.query.page_number) || Constants_helper_1.Constants.PAGE_NUMBER;
                const page_size = parseInt(req.query.page_size) || Constants_helper_1.Constants.PAGE_SIZE;
                const status = parseInt(req.query.status);
                const getServiceRequestsData = yield (0, Organization_util_1.getServiceRequests)(req.user.organization_id, page_number, page_size, status);
                return ResponseFormatter_helper_1.ResponseFormatter.successResponse(res, "Successful", getServiceRequestsData);
            }
            catch (error) {
                return ResponseFormatter_helper_1.ResponseFormatter.errorResponse(res, error.message || 'An error occurred');
            }
        });
    }
    getServiceRequestsId(req, res, serviceRequestsId) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
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
                yield (0, Common_util_1.reportUser)(req.body, req.user.id, req.user.organization_id);
                return ResponseFormatter_helper_1.ResponseFormatter.successResponse(res, 'Users reported');
            }
            catch (error) {
                return ResponseFormatter_helper_1.ResponseFormatter.errorResponse(res, error.message || 'An error occurred');
            }
        });
    }
    changeServiceRequestStatus(req, res, serviceRequestsId, status) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
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
                const addEditClient = yield (0, ServiceRequest_util_1.clients)(req.body, req.user.id, req.user.organization_id);
                return ResponseFormatter_helper_1.ResponseFormatter.successResponse(res, `${addEditClient}`);
            }
            catch (error) {
                return ResponseFormatter_helper_1.ResponseFormatter.errorResponse(res, error.message || 'An error occurred');
            }
        });
    }
    getClients(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const getClients = yield this.organizationService.getClientsByOrganization(req.user.organization_id);
                const customResponse = yield (0, Advocate_util_1.getClientDetails)(getClients, Constants_helper_1.Constants.ROLE_ADVOCATE);
                return ResponseFormatter_helper_1.ResponseFormatter.successResponse(res, "Successful", customResponse);
            }
            catch (error) {
                return ResponseFormatter_helper_1.ResponseFormatter.errorResponse(res, error.message || 'An error occurred');
            }
        });
    }
    getClientsById(req, res, clientId) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const checkIfOrganizationClientExists = yield this.organizationService.checkIfOrganizationClientExists(req.user.organization_id, clientId);
                if (!checkIfOrganizationClientExists) {
                    return ResponseFormatter_helper_1.ResponseFormatter.errorResponse(res, "Not a valid client");
                }
                const customResponse = yield (0, ServiceRequest_util_1.getClientsById)(clientId, req.user.id, req.user.organization_id);
                return ResponseFormatter_helper_1.ResponseFormatter.successResponse(res, "Successful", customResponse);
            }
            catch (error) {
                return ResponseFormatter_helper_1.ResponseFormatter.errorResponse(res, error.message || 'An error occurred');
            }
        });
    }
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
                yield (0, Common_util_1.addClientService)(req.body, req.user.role.id);
                return ResponseFormatter_helper_1.ResponseFormatter.successResponse(res, "Successful");
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
                const { user_id, email } = req.body;
                yield (0, Organization_util_1.removeOrganizationUser)(req.user.organization_id, user_id, email, req.user.id, Constants_helper_1.Constants.ROLE_SERVICE_MANAGER);
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
                const { user_id, email } = req.body;
                yield (0, Organization_util_1.removeOrganizationUser)(req.user.organization_id, user_id, email, req.user.id, Constants_helper_1.Constants.ROLE_SERVICE_MANAGER);
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
                const { user_id, email } = req.body;
                yield (0, Organization_util_1.removeOrganizationUser)(req.user.organization_id, user_id, email, req.user.id, Constants_helper_1.Constants.ROLE_ORGANIZATION_ADMIN);
                return ResponseFormatter_helper_1.ResponseFormatter.successResponse(res, 'Organization admin deleted');
            }
            catch (error) {
                return ResponseFormatter_helper_1.ResponseFormatter.errorResponse(res, error.message || 'An error occurred');
            }
        });
    }
};
exports.AuthController = AuthController;
__decorate([
    (0, routing_controllers_1.Post)("/services"),
    (0, routing_controllers_1.UseBefore)(Auth_middleware_1.authMiddleware),
    (0, routing_controllers_1.UseBefore)(Organization_middleware_1.organizationMiddleware),
    __param(0, (0, routing_controllers_1.Req)()),
    __param(1, (0, routing_controllers_1.Res)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], AuthController.prototype, "addOrganization", null);
__decorate([
    (0, routing_controllers_1.Get)("/services"),
    (0, routing_controllers_1.UseBefore)(Auth_middleware_1.authMiddleware),
    (0, routing_controllers_1.UseBefore)(Organization_middleware_1.organizationMiddleware),
    __param(0, (0, routing_controllers_1.Req)()),
    __param(1, (0, routing_controllers_1.Res)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], AuthController.prototype, "getOrganizations", null);
__decorate([
    (0, routing_controllers_1.Get)("/services/:serviceId"),
    (0, routing_controllers_1.UseBefore)(Auth_middleware_1.authMiddleware),
    (0, routing_controllers_1.UseBefore)(Organization_middleware_1.organizationMiddleware),
    __param(0, (0, routing_controllers_1.Req)()),
    __param(1, (0, routing_controllers_1.Res)()),
    __param(2, (0, routing_controllers_1.Param)("serviceId")),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object, Number]),
    __metadata("design:returntype", Promise)
], AuthController.prototype, "getOrganizationsById", null);
__decorate([
    (0, routing_controllers_1.Delete)("/service-delete/:serviceId"),
    (0, routing_controllers_1.UseBefore)(Auth_middleware_1.authMiddleware),
    (0, routing_controllers_1.UseBefore)(Organization_middleware_1.organizationMiddleware),
    __param(0, (0, routing_controllers_1.Req)()),
    __param(1, (0, routing_controllers_1.Res)()),
    __param(2, (0, routing_controllers_1.Param)("serviceId")),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object, Number]),
    __metadata("design:returntype", Promise)
], AuthController.prototype, "serviceDelete", null);
__decorate([
    (0, routing_controllers_1.Post)("/services-settings"),
    (0, routing_controllers_1.UseBefore)(Auth_middleware_1.authMiddleware),
    (0, routing_controllers_1.UseBefore)(Organization_middleware_1.organizationMiddleware),
    __param(0, (0, routing_controllers_1.Req)()),
    __param(1, (0, routing_controllers_1.Res)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], AuthController.prototype, "addServiceSettings", null);
__decorate([
    (0, routing_controllers_1.Get)("/services-settings/:serviceId"),
    (0, routing_controllers_1.UseBefore)(Auth_middleware_1.authMiddleware),
    (0, routing_controllers_1.UseBefore)(Organization_middleware_1.organizationMiddleware),
    __param(0, (0, routing_controllers_1.Req)()),
    __param(1, (0, routing_controllers_1.Res)()),
    __param(2, (0, routing_controllers_1.Param)("serviceId")),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object, Number]),
    __metadata("design:returntype", Promise)
], AuthController.prototype, "getServiceSettings", null);
__decorate([
    (0, routing_controllers_1.Get)("/details"),
    (0, routing_controllers_1.UseBefore)(Auth_middleware_1.authMiddleware),
    (0, routing_controllers_1.UseBefore)(Organization_middleware_1.organizationMiddleware),
    __param(0, (0, routing_controllers_1.Req)()),
    __param(1, (0, routing_controllers_1.Res)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], AuthController.prototype, "getOrganizationList", null);
__decorate([
    (0, routing_controllers_1.Post)("/edit"),
    (0, routing_controllers_1.UseBefore)(Auth_middleware_1.authMiddleware),
    (0, routing_controllers_1.UseBefore)(Organization_middleware_1.organizationMiddleware),
    (0, routing_controllers_1.UseBefore)(MulterConfig_helper_1.upload.array("affiliation_files", 10)),
    __param(0, (0, routing_controllers_1.Req)()),
    __param(1, (0, routing_controllers_1.Res)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], AuthController.prototype, "updateOrganizationDetails", null);
__decorate([
    (0, routing_controllers_1.Post)("/user-invitation"),
    (0, routing_controllers_1.UseBefore)(Auth_middleware_1.authMiddleware),
    (0, routing_controllers_1.UseBefore)(Organization_middleware_1.organizationMiddleware),
    __param(0, (0, routing_controllers_1.Req)()),
    __param(1, (0, routing_controllers_1.Res)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], AuthController.prototype, "sendInvitation", null);
__decorate([
    (0, routing_controllers_1.Post)("/user-invitation-resend"),
    (0, routing_controllers_1.UseBefore)(Auth_middleware_1.authMiddleware),
    (0, routing_controllers_1.UseBefore)(Organization_middleware_1.organizationMiddleware),
    __param(0, (0, routing_controllers_1.Req)()),
    __param(1, (0, routing_controllers_1.Res)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], AuthController.prototype, "resendInvitation", null);
__decorate([
    (0, routing_controllers_1.Get)("/users"),
    (0, routing_controllers_1.UseBefore)(Auth_middleware_1.authMiddleware),
    (0, routing_controllers_1.UseBefore)(Organization_middleware_1.organizationMiddleware),
    __param(0, (0, routing_controllers_1.Req)()),
    __param(1, (0, routing_controllers_1.Res)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], AuthController.prototype, "getOrganizationUser", null);
__decorate([
    (0, routing_controllers_1.Get)("/service-requests"),
    (0, routing_controllers_1.UseBefore)(Auth_middleware_1.authMiddleware),
    (0, routing_controllers_1.UseBefore)(Organization_middleware_1.organizationMiddleware),
    __param(0, (0, routing_controllers_1.Req)()),
    __param(1, (0, routing_controllers_1.Res)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], AuthController.prototype, "getServiceRequest", null);
__decorate([
    (0, routing_controllers_1.Get)("/service-requests/:serviceRequestsId"),
    (0, routing_controllers_1.UseBefore)(Auth_middleware_1.authMiddleware),
    (0, routing_controllers_1.UseBefore)(Organization_middleware_1.organizationMiddleware),
    __param(0, (0, routing_controllers_1.Req)()),
    __param(1, (0, routing_controllers_1.Res)()),
    __param(2, (0, routing_controllers_1.Param)("serviceRequestsId")),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object, Number]),
    __metadata("design:returntype", Promise)
], AuthController.prototype, "getServiceRequestsId", null);
__decorate([
    (0, routing_controllers_1.Post)("/report-user"),
    (0, routing_controllers_1.UseBefore)(Auth_middleware_1.authMiddleware),
    (0, routing_controllers_1.UseBefore)(Organization_middleware_1.organizationMiddleware),
    __param(0, (0, routing_controllers_1.Req)()),
    __param(1, (0, routing_controllers_1.Res)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], AuthController.prototype, "reportUser", null);
__decorate([
    (0, routing_controllers_1.Patch)("/service-requests/:serviceRequestsId/:status"),
    (0, routing_controllers_1.UseBefore)(Auth_middleware_1.authMiddleware),
    (0, routing_controllers_1.UseBefore)(Organization_middleware_1.organizationMiddleware),
    __param(0, (0, routing_controllers_1.Req)()),
    __param(1, (0, routing_controllers_1.Res)()),
    __param(2, (0, routing_controllers_1.Param)("serviceRequestsId")),
    __param(3, (0, routing_controllers_1.Param)("status")),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object, Number, Number]),
    __metadata("design:returntype", Promise)
], AuthController.prototype, "changeServiceRequestStatus", null);
__decorate([
    (0, routing_controllers_1.Post)("/clients"),
    (0, routing_controllers_1.UseBefore)(Auth_middleware_1.authMiddleware),
    (0, routing_controllers_1.UseBefore)(Organization_middleware_1.organizationMiddleware),
    __param(0, (0, routing_controllers_1.Req)()),
    __param(1, (0, routing_controllers_1.Res)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], AuthController.prototype, "addClient", null);
__decorate([
    (0, routing_controllers_1.Get)("/clients"),
    (0, routing_controllers_1.UseBefore)(Auth_middleware_1.authMiddleware),
    (0, routing_controllers_1.UseBefore)(Organization_middleware_1.organizationMiddleware),
    __param(0, (0, routing_controllers_1.Req)()),
    __param(1, (0, routing_controllers_1.Res)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], AuthController.prototype, "getClients", null);
__decorate([
    (0, routing_controllers_1.Get)("/clients/:clientId"),
    (0, routing_controllers_1.UseBefore)(Auth_middleware_1.authMiddleware),
    (0, routing_controllers_1.UseBefore)(Organization_middleware_1.organizationMiddleware),
    __param(0, (0, routing_controllers_1.Req)()),
    __param(1, (0, routing_controllers_1.Res)()),
    __param(2, (0, routing_controllers_1.Param)("clientId")),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object, Number]),
    __metadata("design:returntype", Promise)
], AuthController.prototype, "getClientsById", null);
__decorate([
    (0, routing_controllers_1.Post)("/service-request/add"),
    (0, routing_controllers_1.UseBefore)(Auth_middleware_1.authMiddleware),
    (0, routing_controllers_1.UseBefore)(Organization_middleware_1.organizationMiddleware),
    __param(0, (0, routing_controllers_1.Req)()),
    __param(1, (0, routing_controllers_1.Res)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], AuthController.prototype, "addClientService", null);
__decorate([
    (0, routing_controllers_1.Post)("/remove/service-manager"),
    (0, routing_controllers_1.UseBefore)(Auth_middleware_1.authMiddleware),
    (0, routing_controllers_1.UseBefore)(Admin_middleware_1.adminMiddleware),
    __param(0, (0, routing_controllers_1.Req)()),
    __param(1, (0, routing_controllers_1.Res)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], AuthController.prototype, "removeServiceManager", null);
__decorate([
    (0, routing_controllers_1.Post)("/remove/advocate"),
    (0, routing_controllers_1.UseBefore)(Auth_middleware_1.authMiddleware),
    (0, routing_controllers_1.UseBefore)(Admin_middleware_1.adminMiddleware),
    __param(0, (0, routing_controllers_1.Req)()),
    __param(1, (0, routing_controllers_1.Res)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], AuthController.prototype, "removeAdvocate", null);
__decorate([
    (0, routing_controllers_1.Post)("/remove/organization-admin"),
    (0, routing_controllers_1.UseBefore)(Auth_middleware_1.authMiddleware),
    (0, routing_controllers_1.UseBefore)(Admin_middleware_1.adminMiddleware),
    __param(0, (0, routing_controllers_1.Req)()),
    __param(1, (0, routing_controllers_1.Res)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], AuthController.prototype, "removeOrganizationAdmin", null);
exports.AuthController = AuthController = __decorate([
    (0, routing_controllers_1.JsonController)("/api/organization")
], AuthController);
