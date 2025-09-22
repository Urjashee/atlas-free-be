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
exports.ConfigService = void 0;
const ormconfig_1 = __importDefault(require("../../ormconfig"));
const ServiceDetailsOptions_entity_1 = require("../entity/ServiceDetailsOptions.entity");
const RegistrationOption_entity_1 = require("../entity/RegistrationOption.entity");
const AdvocateService_entity_1 = require("../entity/AdvocateService.entity");
const typeorm_1 = require("typeorm");
const State_entity_1 = require("../entity/State.entity");
class ConfigService {
    constructor() {
        this.serviceDetailOptionRepository = ormconfig_1.default.getRepository(ServiceDetailsOptions_entity_1.ServiceDetailsOptions);
        this.registrationOptionRepository = ormconfig_1.default.getRepository(RegistrationOption_entity_1.RegistrationOption);
        this.advocateServiceRepository = ormconfig_1.default.getRepository(AdvocateService_entity_1.AdvocateService);
        this.stateRepository = ormconfig_1.default.getRepository(State_entity_1.State);
    }
    getState() {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.stateRepository.find();
        });
    }
    getPrimaryPurpose() {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.registrationOptionRepository.find({
                where: {
                    type: "primary_purpose"
                }
            });
        });
    }
    getPlatformPurpose() {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.registrationOptionRepository.find({
                where: {
                    type: "platform_purpose"
                }
            });
        });
    }
    getAffiliationLicenses() {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.registrationOptionRepository.find({
                where: {
                    type: "affiliations_licenses"
                }
            });
        });
    }
    getServiceOptions(type) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.serviceDetailOptionRepository.find({
                where: {
                    type: type
                }
            });
        });
    }
    getServiceOptionsById(id) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.serviceDetailOptionRepository.findOne({
                where: {
                    id: id
                }
            });
        });
    }
    getAdvocateService() {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.advocateServiceRepository.find();
        });
    }
    getAdvocateServiceById(id) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.advocateServiceRepository.findOne({
                where: {
                    id
                }
            });
        });
    }
    getPrimaryPurposeById(ids) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.registrationOptionRepository.find({
                where: {
                    id: (0, typeorm_1.In)(ids),
                }
            });
        });
    }
}
exports.ConfigService = ConfigService;
