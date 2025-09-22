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
exports.ServiceManagerService = void 0;
const ormconfig_1 = __importDefault(require("../../ormconfig"));
const ServiceDetails_entity_1 = require("../entity/ServiceDetails.entity");
const typeorm_1 = require("typeorm");
class ServiceManagerService {
    constructor() {
        this.serviceDetailsRepository = ormconfig_1.default.getRepository(ServiceDetails_entity_1.ServiceDetails);
    }
    checkIfService(service_id) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.serviceDetailsRepository.findOne({
                where: {
                    id: service_id,
                }
            });
        });
    }
    checkIfValidService(service_id, organization_id, user_id) {
        return __awaiter(this, void 0, void 0, function* () {
            console.log("Checking if valid service", user_id);
            return yield this.serviceDetailsRepository.findOne({
                where: {
                    id: service_id,
                    service_manager: (0, typeorm_1.Raw)(alias => `FIND_IN_SET(:user_id, ${alias}) > 0`, { user_id })
                }
            });
        });
    }
    getServiceManagerService(user_id) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.serviceDetailsRepository.find({
                where: {
                    service_manager: (0, typeorm_1.Raw)(alias => `FIND_IN_SET(:user_id, ${alias}) > 0`, { user_id })
                },
            });
        });
    }
    getServiceManagerServiceById(id, user_id) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.serviceDetailsRepository.findOne({
                where: {
                    id,
                }
            });
        });
    }
    editServiceSettings(body) {
        return __awaiter(this, void 0, void 0, function* () {
            const serviceSetting = yield this.serviceDetailsRepository.findOne({
                where: {
                    id: body.service_id
                },
            });
            // console.log(serviceSetting)
            if (serviceSetting) {
                serviceSetting.slots_available = body.available_slots;
                return yield this.serviceDetailsRepository.save(serviceSetting);
            }
            else {
                return false;
            }
        });
    }
}
exports.ServiceManagerService = ServiceManagerService;
