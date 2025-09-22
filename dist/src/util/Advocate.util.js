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
exports.getClientDetails = getClientDetails;
exports.getServiceRequestsUser = getServiceRequestsUser;
const User_service_1 = require("../services/User.service");
const Organization_service_1 = require("../services/Organization.service");
const Config_service_1 = require("../services/Config.service");
const ClientService_entity_1 = require("../entity/ClientService.entity");
const Constants_helper_1 = require("../helper/Constants.helper");
const AssignedServices_entity_1 = require("../entity/AssignedServices.entity");
const userService = new User_service_1.UserService();
const organizationService = new Organization_service_1.OrganizationService();
const configService = new Config_service_1.ConfigService();
function getClientDetails(clientsDetails, role) {
    return __awaiter(this, void 0, void 0, function* () {
        if (role === Constants_helper_1.Constants.ROLE_ADVOCATE) {
            return yield Promise.all(clientsDetails.map((clients) => __awaiter(this, void 0, void 0, function* () {
                return {
                    id: clients.id,
                    services: yield Promise.all(clients.service.map((item) => __awaiter(this, void 0, void 0, function* () {
                        return {
                            id: item,
                            name: (yield configService.getServiceOptionsById(item)).name
                        };
                    }))),
                    client_nick_name: clients.client_nick_name,
                    zipcode: clients.zipcode,
                    dob: new Date(clients.dob).toISOString().split('T')[0],
                    english_speaking_ability_id: clients.english_speaking_ability,
                    english_speaking_ability: (yield configService.getServiceOptionsById(clients.english_speaking_ability)).name,
                    preferred_language: clients.preferred_language,
                    genders_served: yield Promise.all(clients.gender.map((item) => __awaiter(this, void 0, void 0, function* () {
                        return {
                            id: item,
                            name: (yield configService.getServiceOptionsById(item)).name
                        };
                    }))),
                    race_ethnicity: yield Promise.all(clients.race.map((item) => __awaiter(this, void 0, void 0, function* () {
                        return {
                            id: item,
                            name: (yield configService.getAdvocateServiceById(item)).name
                        };
                    }))),
                    citizenship_status: (yield configService.getAdvocateServiceById(clients.citizenship_status)).name,
                    client_experienced: yield Promise.all(clients.client_experienced.map((item) => __awaiter(this, void 0, void 0, function* () {
                        return {
                            id: item,
                            name: (yield configService.getServiceOptionsById(item)).name
                        };
                    }))),
                    pregnant: clients.pregnant == true ? "Yes" : "No",
                    pregnant_months: clients.pregnant == true ? `${clients.pregnant_months} months` : "",
                    birthdate_status: (yield configService.getAdvocateServiceById(clients.birthdate_status)).name,
                    children_accompany: ClientService_entity_1.ChildrenToAccompany[clients.children_accompany],
                    children_to_accompany: clients.children_to_accompany,
                    criteria: yield Promise.all(clients.criteria.map((item) => __awaiter(this, void 0, void 0, function* () {
                        return {
                            id: item,
                            name: (yield configService.getServiceOptionsById(item)).name
                        };
                    }))),
                    criteria_add: yield Promise.all(clients.criteria_add.map((item) => __awaiter(this, void 0, void 0, function* () {
                        return {
                            id: item,
                            name: (yield configService.getServiceOptionsById(item)).name
                        };
                    }))),
                    medications: yield Promise.all(clients.medications.map((item) => __awaiter(this, void 0, void 0, function* () {
                        return {
                            id: item,
                            name: (yield configService.getServiceOptionsById(item)).name
                        };
                    }))),
                    mental_health_diagnoses: yield Promise.all(clients.mental_health_diagnoses.map((item) => __awaiter(this, void 0, void 0, function* () {
                        return {
                            id: item,
                            name: (yield configService.getServiceOptionsById(item)).name
                        };
                    }))),
                    physical_accommodation: yield Promise.all(clients.physical_accommodation.map((item) => __awaiter(this, void 0, void 0, function* () {
                        return {
                            id: item,
                            name: (yield configService.getServiceOptionsById(item)).name
                        };
                    }))),
                    nicotine_products: yield Promise.all(clients.nicotine_products.map((item) => __awaiter(this, void 0, void 0, function* () {
                        return {
                            id: item,
                            name: (yield configService.getServiceOptionsById(item)).name
                        };
                    }))),
                    specify_physical_accommodation: clients.specify_physical_accommodation
                };
            })));
        }
        if (role === Constants_helper_1.Constants.ROLE_SURVIVOR) {
            return yield Promise.all(clientsDetails.map((clients) => __awaiter(this, void 0, void 0, function* () {
                return {
                    id: clients.id,
                    services: yield Promise.all(clients.service.map((item) => __awaiter(this, void 0, void 0, function* () {
                        return {
                            id: item,
                            name: (yield configService.getServiceOptionsById(item)).name
                        };
                    }))),
                    zipcode: clients.zipcode,
                    dob: new Date(clients.dob).toISOString().split('T')[0],
                    english_speaking_ability_id: clients.english_speaking_ability,
                    english_speaking_ability: (yield configService.getServiceOptionsById(clients.english_speaking_ability)).name,
                    preferred_language: clients.preferred_language,
                    genders_served: yield Promise.all(clients.gender.map((item) => __awaiter(this, void 0, void 0, function* () {
                        return {
                            id: item,
                            name: (yield configService.getServiceOptionsById(item)).name
                        };
                    }))),
                    citizenship_status: (yield configService.getAdvocateServiceById(clients.citizenship_status)).name,
                    client_experienced: yield Promise.all(clients.client_experienced.map((item) => __awaiter(this, void 0, void 0, function* () {
                        return {
                            id: item,
                            name: (yield configService.getServiceOptionsById(item)).name
                        };
                    }))),
                    pregnant: clients.pregnant == true ? "Yes" : "No",
                    pregnant_months: clients.pregnant == true ? `${clients.pregnant_months} months` : "",
                    birthdate_status: (yield configService.getAdvocateServiceById(clients.birthdate_status)).name,
                    children_accompany: ClientService_entity_1.ChildrenToAccompany[clients.children_accompany],
                    children_to_accompany: clients.children_to_accompany,
                    criteria: yield Promise.all(clients.criteria.map((item) => __awaiter(this, void 0, void 0, function* () {
                        return {
                            id: item,
                            name: (yield configService.getServiceOptionsById(item)).name
                        };
                    }))),
                };
            })));
        }
    });
}
function getServiceRequestsUser(serviceRequest) {
    return __awaiter(this, void 0, void 0, function* () {
        return {
            client_service_id: serviceRequest ? serviceRequest.client_service.id : null,
            service_status_id: serviceRequest ? serviceRequest.status : null,
            service_status: serviceRequest ? AssignedServices_entity_1.ClientStatus[Number(serviceRequest.status)] : null,
            service_name: serviceRequest ? serviceRequest.service.name : null,
            service_type: serviceRequest ? (yield configService.getServiceOptionsById(serviceRequest.service.service_type)).name : null,
        };
    });
}
