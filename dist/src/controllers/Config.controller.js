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
Object.defineProperty(exports, "__esModule", { value: true });
exports.ConfigController = void 0;
const routing_controllers_1 = require("routing-controllers");
const Config_service_1 = require("../services/Config.service");
const response_1 = require("@inquitickets/response");
const Constants_helper_1 = require("../helper/Constants.helper");
const ServiceDetails_entity_1 = require("../entity/ServiceDetails.entity");
const EmailReminder_entity_1 = require("../entity/EmailReminder.entity");
const Auth_middleware_1 = require("../middleware/Auth.middleware");
const AssignedServices_entity_1 = require("../entity/AssignedServices.entity");
const Organization_service_1 = require("../services/Organization.service");
let ConfigController = class ConfigController {
    constructor() {
        this.configService = new Config_service_1.ConfigService();
        this.organizationService = new Organization_service_1.OrganizationService();
    }
    config(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const timePeriodArray = Object.keys(ServiceDetails_entity_1.TimePeriod)
                .filter(key => isNaN(Number(key)))
                .map(key => ({
                id: ServiceDetails_entity_1.TimePeriod[key],
                name: key
            }));
            const primaryPurpose = yield this.configService.getPrimaryPurpose();
            const platformPurpose = yield this.configService.getPlatformPurpose();
            const affiliationLicenses = yield this.configService.getAffiliationLicenses();
            const serviceTypes = yield this.configService.getServiceOptions("service_type");
            const slotsBeds = yield this.configService.getServiceOptions("slots_beds");
            const gendersServed = yield this.configService.getServiceOptions("genders_served");
            const servedTo = yield this.configService.getServiceOptions("served_to");
            const citizenship = yield this.configService.getServiceOptions("citizenship");
            const language = yield this.configService.getServiceOptions("language");
            const traffickingStatus = yield this.configService.getServiceOptions("trafficking_status");
            const legal = yield this.configService.getServiceOptions("legal");
            const healthNeeds = yield this.configService.getServiceOptions("health_needs");
            const medications = yield this.configService.getServiceOptions("medications");
            const mentalHealthDiagnoses = yield this.configService.getServiceOptions("mental_health_diagnoses");
            const physicalAccommodations = yield this.configService.getServiceOptions("physical_accommodations");
            const smokingAllowed = yield this.configService.getServiceOptions("smoking_allowed");
            const entryRequirements = yield this.configService.getServiceOptions("entry_requirements");
            const serviceModel = yield this.configService.getServiceOptions("service_model");
            const faithEngagement = yield this.configService.getServiceOptions("faith_engagement");
            const serviceStructure = yield this.configService.getServiceOptions("service_structure");
            const sleepingArrangement = yield this.configService.getServiceOptions("sleeping_arrangement");
            const staffingLevel = yield this.configService.getServiceOptions("staffing_level");
            const teamDiversity = yield this.configService.getServiceOptions("team_diversity");
            const serviceGuidelines = yield this.configService.getServiceOptions("service_guidelines");
            const supportProvided = yield this.configService.getServiceOptions("support_provided");
            const supportOffered = yield this.configService.getServiceOptions("support_offered");
            const advocateService = yield this.configService.getAdvocateService();
            const state = yield this.configService.getState();
            const rolesArray = Object.entries(Constants_helper_1.roleMap).map(([name, id]) => ({ id, name }));
            const stateArray = state.map((item) => {
                return {
                    id: item.id,
                    name: item.name,
                };
            });
            const primaryPurposeArray = primaryPurpose.map((item) => {
                return {
                    id: item.id,
                    name: item.name,
                };
            });
            const platformPurposeArray = platformPurpose.map((item) => {
                return {
                    id: item.id,
                    name: item.name,
                };
            });
            const affiliationLicensesArray = affiliationLicenses.map((item) => {
                return {
                    id: item.id,
                    name: item.name,
                };
            });
            const serviceTypeArray = serviceTypes.map((item) => {
                return {
                    id: item.id,
                    name: item.name,
                    icon: item.icon,
                };
            });
            const slotsBedsArray = slotsBeds.map((item) => {
                return {
                    id: item.id,
                    name: item.name,
                };
            });
            const gendersServedArray = gendersServed.map((item) => {
                return {
                    id: item.id,
                    name: item.name,
                };
            });
            const servedToArray = servedTo.map((item) => {
                return {
                    id: item.id,
                    name: item.name,
                };
            });
            const citizenshipArray = citizenship.map((item) => {
                return {
                    id: item.id,
                    name: item.name,
                };
            });
            const languageArray = language.map((item) => {
                return {
                    id: item.id,
                    name: item.name,
                };
            });
            const traffickingStatusArray = traffickingStatus.map((item) => {
                return {
                    id: item.id,
                    name: item.name,
                };
            });
            const legalArray = legal.map((item) => {
                return {
                    id: item.id,
                    name: item.name,
                };
            });
            const healthNeedsArray = healthNeeds.map((item) => {
                return {
                    id: item.id,
                    name: item.name,
                };
            });
            const medicationsArray = medications.map((item) => {
                return {
                    id: item.id,
                    name: item.name,
                };
            });
            const mentalHealthDiagnosesArray = mentalHealthDiagnoses.map((item) => {
                return {
                    id: item.id,
                    name: item.name,
                };
            });
            const physicalAccommodationsArray = physicalAccommodations.map((item) => {
                return {
                    id: item.id,
                    name: item.name,
                };
            });
            const smokingAllowedArray = smokingAllowed.map((item) => {
                return {
                    id: item.id,
                    name: item.name,
                };
            });
            const entryRequirementsArray = entryRequirements.map((item) => {
                return {
                    id: item.id,
                    name: item.name,
                };
            });
            const serviceModelArray = serviceModel.map((item) => {
                return {
                    id: item.id,
                    name: item.name,
                };
            });
            const faithEngagementArray = faithEngagement.map((item) => {
                return {
                    id: item.id,
                    name: item.name,
                };
            });
            const serviceStructureArray = serviceStructure.map((item) => {
                return {
                    id: item.id,
                    name: item.name,
                };
            });
            const sleepingArrangementArray = sleepingArrangement.map((item) => {
                return {
                    id: item.id,
                    name: item.name,
                };
            });
            const staffingLevelArray = staffingLevel.map((item) => {
                return {
                    id: item.id,
                    name: item.name,
                };
            });
            const teamDiversityArray = teamDiversity.map((item) => {
                return {
                    id: item.id,
                    name: item.name,
                };
            });
            const serviceGuidelinesArray = serviceGuidelines.map((item) => {
                return {
                    id: item.id,
                    name: item.name,
                };
            });
            const supportProvidedArray = supportProvided.map((item) => {
                return {
                    id: item.id,
                    name: item.name,
                };
            });
            const supportOfferedArray = supportOffered.map((item) => {
                return {
                    id: item.id,
                    name: item.name,
                };
            });
            const speakingAbilityArray = advocateService.map((item) => {
                if (item.type == "speaking_ability") {
                    return {
                        id: item.id,
                        name: item.name,
                    };
                }
            }).filter(Boolean);
            const raceEthnicityArray = advocateService.map((item) => {
                if (item.type == "race_ethnicity") {
                    return {
                        id: item.id,
                        name: item.name,
                    };
                }
            }).filter(Boolean);
            const citizenshipStatusArray = advocateService.map((item) => {
                if (item.type == "citizenship_status") {
                    return {
                        id: item.id,
                        name: item.name,
                    };
                }
            }).filter(Boolean);
            const birthdateStatusArray = advocateService.map((item) => {
                if (item.type == "birthdate_status") {
                    return {
                        id: item.id,
                        name: item.name,
                    };
                }
            }).filter(Boolean);
            const dayOfTheWeekArray = Object.keys(EmailReminder_entity_1.DaysOfWeek)
                .filter(key => isNaN(Number(key)))
                .map(key => ({
                id: EmailReminder_entity_1.DaysOfWeek[key],
                name: key
            }));
            const timeZoneArray = Object.keys(EmailReminder_entity_1.TimeZone)
                .filter(key => isNaN(Number(key)))
                .map(key => ({
                id: EmailReminder_entity_1.TimeZone[key],
                name: key
            }));
            const structureArray = Object.keys(ServiceDetails_entity_1.Structure)
                .filter(key => isNaN(Number(key)))
                .map(key => ({
                id: ServiceDetails_entity_1.Structure[key],
                name: key
            }));
            const substanceRecoveryArray = Object.keys(ServiceDetails_entity_1.SubstanceRecovery)
                .filter(key => isNaN(Number(key)))
                .map(key => ({
                id: ServiceDetails_entity_1.SubstanceRecovery[key],
                name: key
            }));
            const faithArray = Object.keys(ServiceDetails_entity_1.Faith)
                .filter(key => isNaN(Number(key)))
                .map(key => ({
                id: ServiceDetails_entity_1.Faith[key],
                name: key
            }));
            const guidelinesArray = Object.keys(ServiceDetails_entity_1.Guidelines)
                .filter(key => isNaN(Number(key)))
                .map(key => ({
                id: ServiceDetails_entity_1.Guidelines[key],
                name: key
            }));
            const staffDiversityArray = Object.keys(ServiceDetails_entity_1.StaffDiversity)
                .filter(key => isNaN(Number(key)))
                .map(key => ({
                id: ServiceDetails_entity_1.StaffDiversity[key],
                name: key
            }));
            const filter = {
                "availability": "Available options only (no waitlist)",
                "children": "Housing accepts children",
                "structure": structureArray,
                "staffing_level": staffingLevelArray,
                "substance_recovery": substanceRecoveryArray,
                "faith": faithArray,
                "living_arrangement": sleepingArrangementArray,
                "guidelines": guidelinesArray,
                "staff_diversity": staffDiversityArray,
            };
            const customResponse = {
                "roles": rolesArray,
                "states": stateArray,
                "primary_purpose": primaryPurposeArray,
                "platform_purpose": platformPurposeArray,
                "affiliation_licenses": affiliationLicensesArray,
                "service_type": serviceTypeArray,
                "slot_beds": slotsBedsArray,
                "time_period": timePeriodArray,
                "genders_served": gendersServedArray,
                "served_to": servedToArray,
                "citizenship_requirements": citizenshipArray,
                "language": languageArray,
                "traffic_status": traffickingStatusArray,
                "legal": legalArray,
                "health_needs": healthNeedsArray,
                "medications": medicationsArray,
                "mental_health_diagnoses": mentalHealthDiagnosesArray,
                "physical_accommodation": physicalAccommodationsArray,
                "nicotine_products": smokingAllowedArray,
                "entry_requirement": entryRequirementsArray,
                "service_model": serviceModelArray,
                "faith_engagement": faithEngagementArray,
                "service_structure": serviceStructureArray,
                "sleeping_arrangement": sleepingArrangementArray,
                "staffing_level": staffingLevelArray,
                "team_diversity": teamDiversityArray,
                "service_guideline": serviceGuidelinesArray,
                "support_provided": supportProvidedArray,
                "support_offered": supportOfferedArray,
                "speaking_ability": speakingAbilityArray,
                "race_ethnicity": raceEthnicityArray,
                "citizenship_status": citizenshipStatusArray,
                "birthdate_status": birthdateStatusArray,
                "day_of_the_week": dayOfTheWeekArray,
                "time_zone": timeZoneArray,
                "filter": filter,
            };
            return response_1.ResponseFormatter.successResponse(res, "Configuration data", customResponse);
        });
    }
    getServiceList(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const page_number = parseInt(req.query.page_number) || Constants_helper_1.Constants.PAGE_NUMBER;
                const page_size = parseInt(req.query.page_size) || Constants_helper_1.Constants.PAGE_SIZE;
                const service_type = parseInt(req.query.service);
                const state = parseInt(req.query.state);
                const city = req.query.city;
                const zipcode = req.query.zipcode;
                const availability = req.query.availability;
                const structure = req.query.structure;
                const children = req.query.children;
                const staffing = parseInt(req.query.staffing);
                const substance = req.query.substance;
                const faith = req.query.faith;
                const living_arrangement = req.query.living_arrangement;
                const guidelines = req.query.guidelines;
                const staff_diversity = req.query.staff_diversity;
                if (!service_type)
                    return response_1.ResponseFormatter.errorResponse(res, 'Service type is required');
                const { data, total } = yield this.organizationService.getServices(page_number, page_size, service_type, state, city, zipcode, availability, structure, staffing, substance, children, faith, living_arrangement, guidelines, staff_diversity);
                const customResponse = [];
                if (data.length > 0) {
                    for (const service of data) {
                        let availability;
                        const serviceType = yield this.configService.getServiceOptionsById(service.service_type);
                        if (service.waitlist == false) {
                            availability = 1;
                        }
                        else {
                            if (service.total_available_slots > service.slots_available) {
                                availability = 0;
                            }
                            if (service.total_available_slots == service.slots_available) {
                                availability = 2;
                            }
                        }
                        customResponse.push({
                            id: service.id,
                            name: service.name,
                            service_type: serviceType.name,
                            address: service.disclose_address === false
                                ? "-"
                                : `${service.street} ${service.city}, ${service.state} ${service.zipcode}`,
                            availability_id: availability,
                            availability: AssignedServices_entity_1.ServiceStatus[availability],
                        });
                    }
                }
                return response_1.ResponseFormatter.successResponse(res, "Successful", {
                    current_page: page_number,
                    page_size,
                    total_items: total,
                    total_pages: Math.ceil(total / page_size),
                    data: customResponse
                });
            }
            catch (error) {
                return response_1.ResponseFormatter.errorResponse(res, error.message || 'An error occurred');
            }
        });
    }
};
exports.ConfigController = ConfigController;
__decorate([
    (0, routing_controllers_1.Get)("/config"),
    __param(0, (0, routing_controllers_1.Req)()),
    __param(1, (0, routing_controllers_1.Res)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], ConfigController.prototype, "config", null);
__decorate([
    (0, routing_controllers_1.Get)("/services"),
    (0, routing_controllers_1.UseBefore)(Auth_middleware_1.authMiddleware),
    __param(0, (0, routing_controllers_1.Req)()),
    __param(1, (0, routing_controllers_1.Res)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], ConfigController.prototype, "getServiceList", null);
exports.ConfigController = ConfigController = __decorate([
    (0, routing_controllers_1.JsonController)("/api")
], ConfigController);
