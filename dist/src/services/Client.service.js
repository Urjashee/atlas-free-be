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
exports.ClientService = void 0;
const ormconfig_1 = __importDefault(require("../../ormconfig"));
const Users_entity_1 = require("../entity/Users.entity");
const Organization_entity_1 = require("../entity/Organization.entity");
const PasswordReset_entity_1 = require("../entity/PasswordReset.entity");
const ServiceDetails_entity_1 = require("../entity/ServiceDetails.entity");
const AssignedServices_entity_1 = require("../entity/AssignedServices.entity");
const ReportService_entity_1 = require("../entity/ReportService.entity");
const ClientService_entity_1 = require("../entity/ClientService.entity");
const Constants_helper_1 = require("../helper/Constants.helper");
const Emails_helper_1 = require("../helper/Emails.helper");
const Email_service_1 = require("./Email.service");
class ClientService {
    constructor() {
        this.userRepository = ormconfig_1.default.getRepository(Users_entity_1.Users);
        this.organizationRepository = ormconfig_1.default.getRepository(Organization_entity_1.Organization);
        this.passwordResetRepository = ormconfig_1.default.getRepository(PasswordReset_entity_1.PasswordReset);
        this.serviceDetailsRepository = ormconfig_1.default.getRepository(ServiceDetails_entity_1.ServiceDetails);
        this.clientServiceRepository = ormconfig_1.default.getRepository(ClientService_entity_1.ClientService);
        this.assignedServiceRepository = ormconfig_1.default.getRepository(AssignedServices_entity_1.AssignedServices);
        this.reportServiceRepository = ormconfig_1.default.getRepository(ReportService_entity_1.ReportService);
        this.mailerService = new Email_service_1.EmailService();
    }
    findExistingServices(organization_id) {
        return __awaiter(this, void 0, void 0, function* () {
            const services = yield this.assignedServiceRepository.find({});
        });
    }
    addService(body, user_id) {
        return __awaiter(this, void 0, void 0, function* () {
            let case_no;
            let isUnique = false;
            while (!isUnique) {
                case_no = generateTenDigitNumber().toString();
                const existing = yield this.assignedServiceRepository.findOne({
                    where: { case_no },
                });
                if (!existing) {
                    isUnique = true;
                }
            }
            const addService = yield this.assignedServiceRepository.create({
                organization: { id: body.organization_id },
                user: { id: user_id },
                client_service: { id: body.client_service_id },
                service: { id: body.service_id },
                case_no
            });
            return yield this.assignedServiceRepository.save(addService);
        });
    }
    getServiceRequests(user_id_1) {
        return __awaiter(this, arguments, void 0, function* (user_id, page_number = 1, page_size = 10, status) {
            const skip = (page_number - 1) * page_size;
            const where = {
                user: { id: user_id },
            };
            if (typeof status === 'number' && status !== AssignedServices_entity_1.ClientStatus.All) {
                where.status = status;
            }
            const [data, total] = yield this.assignedServiceRepository.findAndCount({
                where,
                relations: ["organization", "service", "service.state", "client_service"],
                skip,
                take: page_size,
                order: { created_at: "DESC" }
            });
            return { data, total };
        });
    }
    getServiceRequestById(id) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.assignedServiceRepository.findOne({
                where: {
                    id
                },
                relations: ["organization", "service", "client_service", "user"]
            });
        });
    }
    getClientServiceById(id) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.clientServiceRepository.findOne({
                where: {
                    id
                },
            });
        });
    }
    checkIfValidServiceRequest(id, user_id) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.assignedServiceRepository.findOne({
                where: {
                    id,
                    user: { id: user_id },
                }
            });
        });
    }
    reportService(id, reason, body) {
        return __awaiter(this, void 0, void 0, function* () {
            const createReport = yield this.reportServiceRepository.create({
                reason: reason,
                organization: { id: body.organization.id },
                user: { id: body.advocate.id },
                service: { id: body.service.id }
            });
            const reportedService = yield this.serviceDetailsRepository.findOne({
                where: { id: body.service.id }
            });
            const emailContent = (0, Emails_helper_1.ReportUserEmail)(reportedService.name, reason, "service");
            const mailOptions = {
                from: `"${process.env.MAIL_FROM_NAME}" <${process.env.MAIL_FROM_ADDRESS}>`,
                to: process.env.SUPER_ADMIN_MAIN,
                subject: "Email from Atlas free!",
                html: emailContent
            };
            yield this.mailerService.sendEmail(mailOptions);
            return yield this.reportServiceRepository.save(createReport);
        });
    }
    cancelServiceRequest(id) {
        return __awaiter(this, void 0, void 0, function* () {
            const getServiceRequest = yield this.assignedServiceRepository.findOne({
                where: {
                    id
                }
            });
            if (getServiceRequest) {
                return yield this.assignedServiceRepository.delete(getServiceRequest.id);
            }
            else {
                throw new Error("Service request not found");
            }
        });
    }
    addClient(user_id, organization_id, body, client_id) {
        return __awaiter(this, void 0, void 0, function* () {
            const addService = yield this.clientServiceRepository.create({
                client: { id: user_id },
                service: body.service,
                zipcode: body.zipcode,
                dob: body.dob,
                english_speaking_ability: body.english_speaking_ability,
                gender: body.gender,
                citizenship_status: body.citizenship_status,
                client_experienced: body.client_experienced,
                pregnant: body.pregnant,
                pregnant_months: body.pregnant_months,
                birthdate_status: body.birthdate_status,
                children_accompany: body.children_accompany,
                children_to_accompany: body.children_to_accompany,
                criteria: body.criteria,
            });
            return yield this.clientServiceRepository.save(addService);
        });
    }
    editClient(id, user_id, organization_id, body, client_id) {
        return __awaiter(this, void 0, void 0, function* () {
            const getClient = yield this.clientServiceRepository.findOne({
                where: {
                    id: id,
                    client: { id: client_id },
                }
            });
            if (getClient) {
                getClient.service = body.service;
                getClient.zipcode = body.zipcode;
                getClient.dob = body.dob;
                getClient.english_speaking_ability = body.english_speaking_ability;
                getClient.gender = body.gender;
                getClient.citizenship_status = body.citizenship_status;
                getClient.client_experienced = body.client_experienced;
                getClient.pregnant = body.pregnant;
                getClient.pregnant_months = body.pregnant_months;
                getClient.birthdate_status = body.birthdate_status;
                getClient.children_accompany = body.children_accompany;
                getClient.children_to_accompany = body.children_to_accompany;
                getClient.criteria = body.criteria;
                return yield this.clientServiceRepository.save(getClient);
            }
            return false;
        });
    }
    checkIfValidClient(id, client_id) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.clientServiceRepository.findOne({
                where: {
                    id,
                    client: { id: client_id },
                }
            });
        });
    }
    getClients(client_id) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.clientServiceRepository.find({
                where: {
                    client: { id: client_id },
                },
                order: { created_at: "DESC" }
            });
        });
    }
    getRequestsById(id) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.clientServiceRepository.find({
                where: {
                    id
                }
            });
        });
    }
    checkIfSurvivor(survivor_id) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.userRepository.findOne({
                where: {
                    id: survivor_id,
                    role: { id: Constants_helper_1.Constants.ROLE_SURVIVOR },
                }
            });
        });
    }
    checkIfClientService(id, client_id) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.clientServiceRepository.findOne({
                where: {
                    id,
                    client: { id: client_id },
                }
            });
        });
    }
    getClientsById(client_id) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.clientServiceRepository.find({
                where: {
                    client: { id: client_id },
                }
            });
        });
    }
    updateServiceRequestStatus(id, status) {
        return __awaiter(this, void 0, void 0, function* () {
            const serviceRequest = yield this.assignedServiceRepository.findOne({
                where: { id }
            });
            if (!serviceRequest) {
                throw new Error("Service request not found");
            }
            serviceRequest.status = status;
            return yield this.assignedServiceRepository.save(serviceRequest);
        });
    }
}
exports.ClientService = ClientService;
function generateTenDigitNumber() {
    const min = 100000000000;
    const max = 999999999999;
    return Math.floor(Math.random() * (max - min + 1)) + min;
}
