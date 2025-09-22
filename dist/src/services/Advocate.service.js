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
exports.AdvocateService = void 0;
const ormconfig_1 = __importDefault(require("../../ormconfig"));
const Users_entity_1 = require("../entity/Users.entity");
const Organization_entity_1 = require("../entity/Organization.entity");
const DeviceToken_entity_1 = require("../entity/DeviceToken.entity");
const Affiliations_entity_1 = require("../entity/Affiliations.entity");
const PasswordReset_entity_1 = require("../entity/PasswordReset.entity");
const ServiceDetails_entity_1 = require("../entity/ServiceDetails.entity");
const ClientService_entity_1 = require("../entity/ClientService.entity");
const Constants_helper_1 = require("../helper/Constants.helper");
class AdvocateService {
    constructor() {
        this.userRepository = ormconfig_1.default.getRepository(Users_entity_1.Users);
        this.organizationRepository = ormconfig_1.default.getRepository(Organization_entity_1.Organization);
        this.deviceTokenRepository = ormconfig_1.default.getRepository(DeviceToken_entity_1.DeviceToken);
        this.affiliationRepository = ormconfig_1.default.getRepository(Affiliations_entity_1.Affiliations);
        this.passwordResetRepository = ormconfig_1.default.getRepository(PasswordReset_entity_1.PasswordReset);
        this.serviceDetailsRepository = ormconfig_1.default.getRepository(ServiceDetails_entity_1.ServiceDetails);
        this.clientServiceRepository = ormconfig_1.default.getRepository(ClientService_entity_1.ClientService);
    }
    addClient(user_id, organization_id, body) {
        return __awaiter(this, void 0, void 0, function* () {
            const addService = yield this.clientServiceRepository.create({
                organization: { id: organization_id },
                user: { id: user_id },
                service: body.service,
                client_nick_name: body.client_nick_name,
                zipcode: body.zipcode,
                dob: body.dob,
                english_speaking_ability: body.english_speaking_ability,
                preferred_language: body.preferred_language,
                gender: body.gender,
                race: body.race,
                citizenship_status: body.citizenship_status,
                client_experienced: body.client_experienced,
                pregnant: body.pregnant,
                pregnant_months: body.pregnant_months,
                birthdate_status: body.birthdate_status,
                children_accompany: body.children_accompany,
                children_to_accompany: body.children_to_accompany,
                criteria: body.criteria,
                criteria_add: body.criteria_add,
                medications: body.medications,
                mental_health_diagnoses: body.mental_health_diagnoses,
                physical_accommodation: body.physical_accommodation,
                specify_physical_accommodation: body.specify_physical_accommodation,
                nicotine_products: body.nicotine_products,
            });
            return yield this.clientServiceRepository.save(addService);
        });
    }
    editClient(id, user_id, organization_id, body) {
        return __awaiter(this, void 0, void 0, function* () {
            const getClient = yield this.clientServiceRepository.findOne({
                where: {
                    id: id,
                    user: { id: user_id },
                    organization: { id: organization_id },
                }
            });
            if (getClient) {
                getClient.service = body.service;
                getClient.client_nick_name = body.client_nick_name;
                getClient.zipcode = body.zipcode;
                getClient.dob = body.dob;
                getClient.english_speaking_ability = body.english_speaking_ability;
                getClient.preferred_language = body.preferred_language;
                getClient.gender = body.gender;
                getClient.race = body.race;
                getClient.citizenship_status = body.citizenship_status;
                getClient.client_experienced = body.client_experienced;
                getClient.pregnant = body.pregnant;
                getClient.pregnant_months = body.pregnant_months;
                getClient.birthdate_status = body.birthdate_status;
                getClient.children_accompany = body.children_accompany;
                getClient.children_to_accompany = body.children_to_accompany;
                getClient.criteria = body.criteria;
                getClient.criteria_add = body.criteria_add;
                getClient.medications = body.medications;
                getClient.mental_health_diagnoses = body.mental_health_diagnoses;
                getClient.physical_accommodation = body.physical_accommodation;
                getClient.specify_physical_accommodation = body.specify_physical_accommodation;
                getClient.nicotine_products = body.nicotine_products;
                return yield this.clientServiceRepository.save(getClient);
            }
            return false;
        });
    }
    checkIfValidClient(id, advocate_id) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.clientServiceRepository.findOne({
                where: {
                    id,
                    user: { id: advocate_id },
                }
            });
        });
    }
    checkIfValidOrganization(organization_id, advocate_id) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.userRepository.findOne({
                where: {
                    id: advocate_id,
                    organization: { id: organization_id },
                }
            });
        });
    }
    getClients(advocate) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.clientServiceRepository.find({
                where: {
                    user: { id: advocate },
                },
                order: { created_at: "DESC" }
            });
        });
    }
    getClientsById(id) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.clientServiceRepository.find({
                where: {
                    id
                }
            });
        });
    }
    checkIfAdvocate(advocate_id) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.userRepository.findOne({
                where: {
                    id: advocate_id,
                    role: { id: Constants_helper_1.Constants.ROLE_ADVOCATE },
                }
            });
        });
    }
    checkIfAdvocateClient(advocate_id, id) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.clientServiceRepository.findOne({
                where: {
                    id,
                    user: { id: advocate_id },
                }
            });
        });
    }
}
exports.AdvocateService = AdvocateService;
