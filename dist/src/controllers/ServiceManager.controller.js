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
exports.ServiceManagerController = void 0;
const routing_controllers_1 = require("routing-controllers");
const Auth_middleware_1 = require("../middleware/Auth.middleware");
const ResponseFormatter_helper_1 = require("../helper/ResponseFormatter.helper");
const User_service_1 = require("../services/User.service");
const Organization_service_1 = require("../services/Organization.service");
const Config_service_1 = require("../services/Config.service");
const ServiceManager_middleware_1 = require("../middleware/ServiceManager.middleware");
const ServiceManager_service_1 = require("../services/ServiceManager.service");
const Services_schema_1 = require("../schema/Services.schema");
const Organization_util_1 = require("../util/Organization.util");
const joi_1 = __importDefault(require("joi"));
const Constants_helper_1 = require("../helper/Constants.helper");
const Advocate_util_1 = require("../util/Advocate.util");
const Client_service_1 = require("../services/Client.service");
const Advocate_service_1 = require("../services/Advocate.service");
const Organization_schema_1 = require("../schema/Organization.schema");
const Client_schema_1 = require("../schema/Client.schema");
const ServiceRequest_util_1 = require("../util/ServiceRequest.util");
const Common_util_1 = require("../util/Common.util");
const serviceSettingsSchema = joi_1.default.object({
    service_id: joi_1.default.number().required(),
    available_slots: joi_1.default.number().required(),
});
let ServiceManagerController = class ServiceManagerController {
    constructor() {
        this.userService = new User_service_1.UserService();
        this.organizationService = new Organization_service_1.OrganizationService();
        this.configService = new Config_service_1.ConfigService();
        this.serviceManagerService = new ServiceManager_service_1.ServiceManagerService();
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
                if (!req.body.id)
                    return ResponseFormatter_helper_1.ResponseFormatter.errorResponse(res, 'Service ID is required.');
                const checkIfValidService = yield this.serviceManagerService.checkIfValidService(req.body.id, req.user.organization_id, req.user.id);
                if (!checkIfValidService)
                    return ResponseFormatter_helper_1.ResponseFormatter.errorResponse(res, 'Invalid service');
                const settings = yield this.organizationService.editServiceDetails(req.body.id, req.user.organization_id, req.user.role, req.body, req.user.id);
                if (!settings)
                    return ResponseFormatter_helper_1.ResponseFormatter.errorResponse(res, "Can't edit, try again later");
                return ResponseFormatter_helper_1.ResponseFormatter.successResponse(res, "Successfully updated service settings.");
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
                const getOrganizationServices = yield this.serviceManagerService.getServiceManagerService(req.user.id);
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
                const checkIfValidService = yield this.serviceManagerService.checkIfValidService(serviceId, req.user.organization_id, req.user.id);
                if (!checkIfValidService)
                    return ResponseFormatter_helper_1.ResponseFormatter.errorResponse(res, 'Invalid service');
                const getOrganizationServices = yield this.serviceManagerService.getServiceManagerServiceById(serviceId, req.user.id);
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
                const { error } = serviceSettingsSchema.validate(req.body);
                if (error) {
                    return ResponseFormatter_helper_1.ResponseFormatter.errorResponse(res, error.details[0].message);
                }
                const checkIfValidService = yield this.organizationService.checkIfValidOrganization(req.body.service_id, req.user.organization_id);
                if (!checkIfValidService)
                    return ResponseFormatter_helper_1.ResponseFormatter.errorResponse(res, "Not a valid service");
                const checkIfValidServiceManager = yield this.serviceManagerService.checkIfValidService(req.body.service_id, req.user.organization_id, req.user.id);
                if (!checkIfValidServiceManager)
                    return ResponseFormatter_helper_1.ResponseFormatter.errorResponse(res, "Not a valid service manager");
                const checkIfServiceSettings = yield this.organizationService.checkIfServiceExists(req.body.service_id);
                if (checkIfServiceSettings) {
                    const editServiceSettings = yield this.serviceManagerService.editServiceSettings(req.body);
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
    getServiceRequest(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const page_number = parseInt(req.query.page_number) || Constants_helper_1.Constants.PAGE_NUMBER;
                const page_size = parseInt(req.query.page_size) || Constants_helper_1.Constants.PAGE_SIZE;
                const status = parseInt(req.query.status);
                const { data, total } = yield this.organizationService.getServiceRequests(req.user.organization_id, page_number, page_size, status);
                const customResponse = [];
                for (const service of data) {
                    const user = yield this.userService.findById(service.user.id);
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
                return ResponseFormatter_helper_1.ResponseFormatter.successResponse(res, "Successful", {
                    current_page: page_number,
                    page_size,
                    total_items: total,
                    total_pages: Math.ceil(total / page_size),
                    data: customResponse
                });
            }
            catch (error) {
                return ResponseFormatter_helper_1.ResponseFormatter.errorResponse(res, error.message || 'An error occurred');
            }
        });
    }
    getServiceRequestsId(req, res, serviceRequestsId) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const getServiceRequest = yield this.clientService.getServiceRequestById(serviceRequestsId);
                if (!getServiceRequest) {
                    return ResponseFormatter_helper_1.ResponseFormatter.errorResponse(res, "Service request not found");
                }
                let client, form;
                const user = yield this.userService.findById(getServiceRequest.user.id);
                const getClients = yield this.advocateService.getClientsById(getServiceRequest.id);
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
                const customResponse = {
                    client: client,
                    form: form,
                };
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
                const { type, reported_user, reason } = req.body;
                if (type == 'survivor') {
                    const checkIfSurvivorUser = yield this.userService.checkIfSurvivor(reported_user);
                    if (!checkIfSurvivorUser) {
                        return ResponseFormatter_helper_1.ResponseFormatter.errorResponse(res, "Not a valid user");
                    }
                }
                if (type == 'advocate') {
                    const checkIfAdvocateUser = yield this.userService.checkIfAdvocate(reported_user);
                    if (!checkIfAdvocateUser) {
                        return ResponseFormatter_helper_1.ResponseFormatter.errorResponse(res, "Not a valid advocate");
                    }
                }
                const reportUser = yield this.organizationService.reportUser(type, reported_user, reason, req.user.id, req.user.organization_id);
                if (!reportUser)
                    return ResponseFormatter_helper_1.ResponseFormatter.errorResponse(res, "Can't report user, try again later");
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
                const getClients = yield this.advocateService.getClients(req.user.id);
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
                const customResponse = yield (0, ServiceRequest_util_1.getClientsById)(clientId, req.user.id);
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
};
exports.ServiceManagerController = ServiceManagerController;
__decorate([
    (0, routing_controllers_1.Post)("/services"),
    (0, routing_controllers_1.UseBefore)(Auth_middleware_1.authMiddleware),
    (0, routing_controllers_1.UseBefore)(ServiceManager_middleware_1.serviceManagerMiddleware),
    __param(0, (0, routing_controllers_1.Req)()),
    __param(1, (0, routing_controllers_1.Res)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], ServiceManagerController.prototype, "addOrganization", null);
__decorate([
    (0, routing_controllers_1.Get)("/services"),
    (0, routing_controllers_1.UseBefore)(Auth_middleware_1.authMiddleware),
    (0, routing_controllers_1.UseBefore)(ServiceManager_middleware_1.serviceManagerMiddleware),
    __param(0, (0, routing_controllers_1.Req)()),
    __param(1, (0, routing_controllers_1.Res)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], ServiceManagerController.prototype, "getOrganizations", null);
__decorate([
    (0, routing_controllers_1.Get)("/services/:serviceId"),
    (0, routing_controllers_1.UseBefore)(Auth_middleware_1.authMiddleware),
    (0, routing_controllers_1.UseBefore)(ServiceManager_middleware_1.serviceManagerMiddleware),
    __param(0, (0, routing_controllers_1.Req)()),
    __param(1, (0, routing_controllers_1.Res)()),
    __param(2, (0, routing_controllers_1.Param)("serviceId")),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object, Number]),
    __metadata("design:returntype", Promise)
], ServiceManagerController.prototype, "getOrganizationsById", null);
__decorate([
    (0, routing_controllers_1.Post)("/services-settings"),
    (0, routing_controllers_1.UseBefore)(Auth_middleware_1.authMiddleware),
    (0, routing_controllers_1.UseBefore)(ServiceManager_middleware_1.serviceManagerMiddleware),
    __param(0, (0, routing_controllers_1.Req)()),
    __param(1, (0, routing_controllers_1.Res)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], ServiceManagerController.prototype, "addServiceSettings", null);
__decorate([
    (0, routing_controllers_1.Get)("/service-requests"),
    (0, routing_controllers_1.UseBefore)(Auth_middleware_1.authMiddleware),
    (0, routing_controllers_1.UseBefore)(ServiceManager_middleware_1.serviceManagerMiddleware),
    __param(0, (0, routing_controllers_1.Req)()),
    __param(1, (0, routing_controllers_1.Res)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], ServiceManagerController.prototype, "getServiceRequest", null);
__decorate([
    (0, routing_controllers_1.Get)("/service-requests/:serviceRequestsId"),
    (0, routing_controllers_1.UseBefore)(Auth_middleware_1.authMiddleware),
    (0, routing_controllers_1.UseBefore)(ServiceManager_middleware_1.serviceManagerMiddleware),
    __param(0, (0, routing_controllers_1.Req)()),
    __param(1, (0, routing_controllers_1.Res)()),
    __param(2, (0, routing_controllers_1.Param)("serviceRequestsId")),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object, Number]),
    __metadata("design:returntype", Promise)
], ServiceManagerController.prototype, "getServiceRequestsId", null);
__decorate([
    (0, routing_controllers_1.Post)("/report-user"),
    (0, routing_controllers_1.UseBefore)(Auth_middleware_1.authMiddleware),
    (0, routing_controllers_1.UseBefore)(ServiceManager_middleware_1.serviceManagerMiddleware),
    __param(0, (0, routing_controllers_1.Req)()),
    __param(1, (0, routing_controllers_1.Res)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], ServiceManagerController.prototype, "reportUser", null);
__decorate([
    (0, routing_controllers_1.Patch)("/service-request/:serviceRequestsId/:status"),
    (0, routing_controllers_1.UseBefore)(Auth_middleware_1.authMiddleware),
    (0, routing_controllers_1.UseBefore)(ServiceManager_middleware_1.serviceManagerMiddleware),
    __param(0, (0, routing_controllers_1.Req)()),
    __param(1, (0, routing_controllers_1.Res)()),
    __param(2, (0, routing_controllers_1.Param)("serviceRequestsId")),
    __param(3, (0, routing_controllers_1.Param)("status")),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object, Number, Number]),
    __metadata("design:returntype", Promise)
], ServiceManagerController.prototype, "changeServiceRequestStatus", null);
__decorate([
    (0, routing_controllers_1.Post)("/clients"),
    (0, routing_controllers_1.UseBefore)(Auth_middleware_1.authMiddleware),
    (0, routing_controllers_1.UseBefore)(ServiceManager_middleware_1.serviceManagerMiddleware),
    __param(0, (0, routing_controllers_1.Req)()),
    __param(1, (0, routing_controllers_1.Res)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], ServiceManagerController.prototype, "addClient", null);
__decorate([
    (0, routing_controllers_1.Get)("/clients"),
    (0, routing_controllers_1.UseBefore)(Auth_middleware_1.authMiddleware),
    (0, routing_controllers_1.UseBefore)(ServiceManager_middleware_1.serviceManagerMiddleware),
    __param(0, (0, routing_controllers_1.Req)()),
    __param(1, (0, routing_controllers_1.Res)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], ServiceManagerController.prototype, "getClients", null);
__decorate([
    (0, routing_controllers_1.Get)("/clients/:clientId"),
    (0, routing_controllers_1.UseBefore)(Auth_middleware_1.authMiddleware),
    (0, routing_controllers_1.UseBefore)(ServiceManager_middleware_1.serviceManagerMiddleware),
    __param(0, (0, routing_controllers_1.Req)()),
    __param(1, (0, routing_controllers_1.Res)()),
    __param(2, (0, routing_controllers_1.Param)("clientId")),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object, Number]),
    __metadata("design:returntype", Promise)
], ServiceManagerController.prototype, "getClientsById", null);
__decorate([
    (0, routing_controllers_1.Post)("/service-request/add"),
    (0, routing_controllers_1.UseBefore)(Auth_middleware_1.authMiddleware),
    (0, routing_controllers_1.UseBefore)(ServiceManager_middleware_1.serviceManagerMiddleware),
    __param(0, (0, routing_controllers_1.Req)()),
    __param(1, (0, routing_controllers_1.Res)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], ServiceManagerController.prototype, "addClientService", null);
exports.ServiceManagerController = ServiceManagerController = __decorate([
    (0, routing_controllers_1.JsonController)("/api/service-manager")
], ServiceManagerController);
