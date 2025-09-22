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
exports.AdvocateController = void 0;
const routing_controllers_1 = require("routing-controllers");
const User_service_1 = require("../services/User.service");
const Organization_service_1 = require("../services/Organization.service");
const Config_service_1 = require("../services/Config.service");
const ServiceManager_service_1 = require("../services/ServiceManager.service");
const Auth_middleware_1 = require("../middleware/Auth.middleware");
const ResponseFormatter_helper_1 = require("../helper/ResponseFormatter.helper");
const Advocate_middleware_1 = require("../middleware/Advocate.middleware");
const Client_schema_1 = require("../schema/Client.schema");
const Advocate_service_1 = require("../services/Advocate.service");
const Organization_util_1 = require("../util/Organization.util");
const Advocate_util_1 = require("../util/Advocate.util");
const Constants_helper_1 = require("../helper/Constants.helper");
const joi_1 = __importDefault(require("joi"));
const Client_service_1 = require("../services/Client.service");
const AssignedServices_entity_1 = require("../entity/AssignedServices.entity");
const Common_util_1 = require("../util/Common.util");
const Services_schema_1 = require("../schema/Services.schema");
const reportServiceSchema = joi_1.default.object({
    service_request_id: joi_1.default.number().required(),
    reason: joi_1.default.string().required(),
});
let AdvocateController = class AdvocateController {
    constructor() {
        this.userService = new User_service_1.UserService();
        this.organizationService = new Organization_service_1.OrganizationService();
        this.configService = new Config_service_1.ConfigService();
        this.serviceManagerService = new ServiceManager_service_1.ServiceManagerService();
        this.advocateService = new Advocate_service_1.AdvocateService();
        this.clientService = new Client_service_1.ClientService();
    }
    addOrganization(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                if (!req.body) {
                    return ResponseFormatter_helper_1.ResponseFormatter.errorResponse(res, 'Request body is undefined.');
                }
                const { error } = Client_schema_1.clientSchema.validate(req.body);
                if (error) {
                    return ResponseFormatter_helper_1.ResponseFormatter.errorResponse(res, error.details[0].message);
                }
                if (req.body.id) {
                    const checkIfValidOrganization = yield this.advocateService.checkIfValidClient(req.body.id, req.user.id);
                    if (!checkIfValidOrganization)
                        return ResponseFormatter_helper_1.ResponseFormatter.errorResponse(res, 'Invalid client');
                    const editClientDetails = yield this.advocateService.editClient(req.body.id, req.user.id, req.user.organization_id, req.body);
                    if (!editClientDetails)
                        return ResponseFormatter_helper_1.ResponseFormatter.errorResponse(res, "Can't edit, try again later");
                    return ResponseFormatter_helper_1.ResponseFormatter.successResponse(res, "Successfully updated clients.");
                }
                else {
                    const addClientDetails = yield this.advocateService.addClient(req.user.id, req.user.organization_id, req.body);
                    if (!addClientDetails)
                        return ResponseFormatter_helper_1.ResponseFormatter.errorResponse(res, "Can't add, try again later");
                    return ResponseFormatter_helper_1.ResponseFormatter.successResponse(res, "Successfully added clients.");
                }
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
                const checkIfValidOrganization = yield this.advocateService.checkIfValidClient(clientId, req.user.id);
                if (!checkIfValidOrganization)
                    return ResponseFormatter_helper_1.ResponseFormatter.errorResponse(res, 'Invalid client');
                const getClients = yield this.advocateService.getClientsById(clientId);
                const customResponse = yield (0, Advocate_util_1.getClientDetails)(getClients, Constants_helper_1.Constants.ROLE_ADVOCATE);
                return ResponseFormatter_helper_1.ResponseFormatter.successResponse(res, "Successful", customResponse);
            }
            catch (error) {
                return ResponseFormatter_helper_1.ResponseFormatter.errorResponse(res, error.message || 'An error occurred');
            }
        });
    }
    getOrganizationById(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const checkIfValidOrganization = yield this.advocateService.checkIfValidOrganization(req.user.organization_id, req.user.id);
                if (!checkIfValidOrganization)
                    return ResponseFormatter_helper_1.ResponseFormatter.errorResponse(res, 'Invalid organization');
                const organization = yield this.organizationService.getOrganizationsById(req.user.organization_id);
                const customResponse = yield (0, Organization_util_1.getOrganizationsDetails)(organization);
                return ResponseFormatter_helper_1.ResponseFormatter.successResponse(res, "Organization", customResponse);
            }
            catch (error) {
                return ResponseFormatter_helper_1.ResponseFormatter.errorResponse(res, error.message || 'An error occurred');
            }
        });
    }
    getOrganizationsById(req, res, serviceId) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const checkIfValidOrganization = yield this.advocateService.checkIfValidOrganization(req.user.organization_id, req.user.id);
                if (!checkIfValidOrganization)
                    return ResponseFormatter_helper_1.ResponseFormatter.errorResponse(res, 'Invalid organization');
                const getOrganizationServices = yield this.organizationService.getOrganizationsServiceById(serviceId);
                const customResponse = yield (0, Organization_util_1.getOrganizationsServiceDetails)(getOrganizationServices);
                return ResponseFormatter_helper_1.ResponseFormatter.successResponse(res, "Successful", customResponse);
            }
            catch (error) {
                return ResponseFormatter_helper_1.ResponseFormatter.errorResponse(res, error.message || 'An error occurred');
            }
        });
    }
    getServiceDetails(req, res, serviceId) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const getServices = yield this.organizationService.getOrganizationsServiceById(serviceId);
                const customResponseService = yield (0, Organization_util_1.getOrganizationsServiceDetails)(getServices);
                const organization = yield this.organizationService.getOrganizationsById(getServices.organization.id);
                const customResponseOrganization = yield (0, Organization_util_1.getOrganizationsDetails)(organization);
                const customResponse = {
                    organization: customResponseOrganization,
                    service: customResponseService,
                };
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
    getClient(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const page_number = parseInt(req.query.page_number) || Constants_helper_1.Constants.PAGE_NUMBER;
                const page_size = parseInt(req.query.page_size) || Constants_helper_1.Constants.PAGE_SIZE;
                const status = parseInt(req.query.status);
                const { data, total } = yield this.clientService.getServiceRequests(req.user.id, page_number, page_size, status);
                const customResponse = data.map(service => ({
                    id: service.id,
                    service_id: service.service.id,
                    service: service.service.name,
                    client_id: service.client_service.id,
                    case_no: service.case_no,
                    client_nick_name: service.client_service.client_nick_name,
                    service_request: service.status
                }));
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
                const getServiceRequests = yield this.clientService.getServiceRequestById(serviceRequestsId);
                const getServices = yield this.organizationService.getOrganizationsServiceById(getServiceRequests.service.id);
                const customServiceRequests = yield (0, Advocate_util_1.getServiceRequestsUser)(getServiceRequests);
                const customResponseService = yield (0, Organization_util_1.getOrganizationsServiceDetails)(getServices);
                const customResponse = {
                    client: customServiceRequests,
                    service: customResponseService,
                };
                return ResponseFormatter_helper_1.ResponseFormatter.successResponse(res, "Successful", customResponse);
            }
            catch (error) {
                return ResponseFormatter_helper_1.ResponseFormatter.errorResponse(res, error.message || 'An error occurred');
            }
        });
    }
    reportService(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                if (!req.body) {
                    return ResponseFormatter_helper_1.ResponseFormatter.errorResponse(res, 'Request body is undefined.');
                }
                const { error } = reportServiceSchema.validate(req.body);
                if (error) {
                    return ResponseFormatter_helper_1.ResponseFormatter.errorResponse(res, error.details[0].message);
                }
                const { serviceRequestsId, reason } = req.body;
                const getServiceRequests = yield this.clientService.getServiceRequestById(serviceRequestsId);
                if (!getServiceRequests)
                    return ResponseFormatter_helper_1.ResponseFormatter.errorResponse(res, 'Invalid service request');
                if (getServiceRequests.user.id !== req.user.id)
                    return ResponseFormatter_helper_1.ResponseFormatter.errorResponse(res, 'You are not authorized to report this service request');
                const checkIfService = yield this.serviceManagerService.checkIfService(getServiceRequests.service.id);
                if (!checkIfService)
                    return ResponseFormatter_helper_1.ResponseFormatter.errorResponse(res, 'Invalid service');
                const reportService = yield this.clientService.reportService(serviceRequestsId, reason, getServiceRequests);
                if (!reportService)
                    return ResponseFormatter_helper_1.ResponseFormatter.errorResponse(res, "Can't report, try again later");
                return ResponseFormatter_helper_1.ResponseFormatter.successResponse(res, "Successful reported service");
            }
            catch (error) {
                return ResponseFormatter_helper_1.ResponseFormatter.errorResponse(res, error.message || 'An error occurred');
            }
        });
    }
    cancelServiceRequests(req, res, serviceRequestsId) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const getServiceRequests = yield this.clientService.getServiceRequestById(serviceRequestsId);
                if (!getServiceRequests)
                    return ResponseFormatter_helper_1.ResponseFormatter.errorResponse(res, 'Invalid service request');
                if (getServiceRequests.user.id !== req.user.id)
                    return ResponseFormatter_helper_1.ResponseFormatter.errorResponse(res, 'You are not authorized to report this service request');
                const deleteServiceRequest = yield this.clientService.updateServiceRequestStatus(serviceRequestsId, AssignedServices_entity_1.ClientStatus.Cancelled);
                if (!deleteServiceRequest)
                    return ResponseFormatter_helper_1.ResponseFormatter.errorResponse(res, "Can't cancel, try again later");
                return ResponseFormatter_helper_1.ResponseFormatter.successResponse(res, "Successful cancelled service request");
            }
            catch (error) {
                return ResponseFormatter_helper_1.ResponseFormatter.errorResponse(res, error.message || 'An error occurred');
            }
        });
    }
};
exports.AdvocateController = AdvocateController;
__decorate([
    (0, routing_controllers_1.Post)("/clients"),
    (0, routing_controllers_1.UseBefore)(Auth_middleware_1.authMiddleware),
    (0, routing_controllers_1.UseBefore)(Advocate_middleware_1.advocateMiddleware),
    __param(0, (0, routing_controllers_1.Req)()),
    __param(1, (0, routing_controllers_1.Res)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], AdvocateController.prototype, "addOrganization", null);
__decorate([
    (0, routing_controllers_1.Get)("/clients"),
    (0, routing_controllers_1.UseBefore)(Auth_middleware_1.authMiddleware),
    (0, routing_controllers_1.UseBefore)(Advocate_middleware_1.advocateMiddleware),
    __param(0, (0, routing_controllers_1.Req)()),
    __param(1, (0, routing_controllers_1.Res)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], AdvocateController.prototype, "getClients", null);
__decorate([
    (0, routing_controllers_1.Get)("/clients/:clientId"),
    (0, routing_controllers_1.UseBefore)(Auth_middleware_1.authMiddleware),
    (0, routing_controllers_1.UseBefore)(Advocate_middleware_1.advocateMiddleware),
    __param(0, (0, routing_controllers_1.Req)()),
    __param(1, (0, routing_controllers_1.Res)()),
    __param(2, (0, routing_controllers_1.Param)("clientId")),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object, Number]),
    __metadata("design:returntype", Promise)
], AdvocateController.prototype, "getClientsById", null);
__decorate([
    (0, routing_controllers_1.Get)("/organization/details"),
    (0, routing_controllers_1.UseBefore)(Auth_middleware_1.authMiddleware),
    (0, routing_controllers_1.UseBefore)(Advocate_middleware_1.advocateMiddleware),
    __param(0, (0, routing_controllers_1.Req)()),
    __param(1, (0, routing_controllers_1.Res)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], AdvocateController.prototype, "getOrganizationById", null);
__decorate([
    (0, routing_controllers_1.Get)("/services/:serviceId"),
    (0, routing_controllers_1.UseBefore)(Auth_middleware_1.authMiddleware),
    (0, routing_controllers_1.UseBefore)(Advocate_middleware_1.advocateMiddleware),
    __param(0, (0, routing_controllers_1.Req)()),
    __param(1, (0, routing_controllers_1.Res)()),
    __param(2, (0, routing_controllers_1.Param)("serviceId")),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object, Number]),
    __metadata("design:returntype", Promise)
], AdvocateController.prototype, "getOrganizationsById", null);
__decorate([
    (0, routing_controllers_1.Get)("/service-details/:serviceId"),
    (0, routing_controllers_1.UseBefore)(Auth_middleware_1.authMiddleware),
    (0, routing_controllers_1.UseBefore)(Advocate_middleware_1.advocateMiddleware),
    __param(0, (0, routing_controllers_1.Req)()),
    __param(1, (0, routing_controllers_1.Res)()),
    __param(2, (0, routing_controllers_1.Param)("serviceId")),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object, Number]),
    __metadata("design:returntype", Promise)
], AdvocateController.prototype, "getServiceDetails", null);
__decorate([
    (0, routing_controllers_1.Post)("/service-request/add"),
    (0, routing_controllers_1.UseBefore)(Auth_middleware_1.authMiddleware),
    (0, routing_controllers_1.UseBefore)(Advocate_middleware_1.advocateMiddleware),
    __param(0, (0, routing_controllers_1.Req)()),
    __param(1, (0, routing_controllers_1.Res)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], AdvocateController.prototype, "addClientService", null);
__decorate([
    (0, routing_controllers_1.Get)("/service-requests"),
    (0, routing_controllers_1.UseBefore)(Auth_middleware_1.authMiddleware),
    (0, routing_controllers_1.UseBefore)(Advocate_middleware_1.advocateMiddleware),
    __param(0, (0, routing_controllers_1.Req)()),
    __param(1, (0, routing_controllers_1.Res)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], AdvocateController.prototype, "getClient", null);
__decorate([
    (0, routing_controllers_1.Get)("/service-requests/:serviceRequestsId"),
    (0, routing_controllers_1.UseBefore)(Auth_middleware_1.authMiddleware),
    (0, routing_controllers_1.UseBefore)(Advocate_middleware_1.advocateMiddleware),
    __param(0, (0, routing_controllers_1.Req)()),
    __param(1, (0, routing_controllers_1.Res)()),
    __param(2, (0, routing_controllers_1.Param)("serviceRequestsId")),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object, Number]),
    __metadata("design:returntype", Promise)
], AdvocateController.prototype, "getServiceRequestsId", null);
__decorate([
    (0, routing_controllers_1.Post)("/service-report"),
    (0, routing_controllers_1.UseBefore)(Auth_middleware_1.authMiddleware),
    (0, routing_controllers_1.UseBefore)(Advocate_middleware_1.advocateMiddleware),
    __param(0, (0, routing_controllers_1.Req)()),
    __param(1, (0, routing_controllers_1.Res)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], AdvocateController.prototype, "reportService", null);
__decorate([
    (0, routing_controllers_1.Delete)("/service-requests/:serviceRequestsId"),
    (0, routing_controllers_1.UseBefore)(Auth_middleware_1.authMiddleware),
    (0, routing_controllers_1.UseBefore)(Advocate_middleware_1.advocateMiddleware),
    __param(0, (0, routing_controllers_1.Req)()),
    __param(1, (0, routing_controllers_1.Res)()),
    __param(2, (0, routing_controllers_1.Param)("serviceRequestsId")),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object, Number]),
    __metadata("design:returntype", Promise)
], AdvocateController.prototype, "cancelServiceRequests", null);
exports.AdvocateController = AdvocateController = __decorate([
    (0, routing_controllers_1.JsonController)("/api/advocate")
], AdvocateController);
