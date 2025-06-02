import { Get, JsonController, Req, Res } from "routing-controllers";
import { Request, Response } from "express";
import { ConfigService } from "../services/Config.service";
import { ResponseFormatter } from "@inquitickets/response";
import {Constants, roleMap} from "../helper/Constants.helper";
import {TimePeriod} from "../entity/ServiceDetails.entity";

@JsonController("/api")
export class ConfigController {
    private configService = new ConfigService();

    @Get("/config")
    async config(@Req() req: Request, @Res() res: Response) {

        const timePeriodArray = Object.keys(TimePeriod)
            .filter(key => isNaN(Number(key)))
            .map(key => ({
                id: TimePeriod[key as keyof typeof TimePeriod],
                name: key
            }));

        const primaryPurpose = await this.configService.getPrimaryPurpose();
        const platformPurpose = await this.configService.getPlatformPurpose();
        const affiliationLicenses = await this.configService.getAffiliationLicenses();
        const serviceTypes = await this.configService.getServiceOptions("service_type");
        const slotsBeds = await this.configService.getServiceOptions("slots_beds");
        const gendersServed = await this.configService.getServiceOptions("genders_served");
        const servedTo = await this.configService.getServiceOptions("served_to");
        const citizenship = await this.configService.getServiceOptions("citizenship");
        const language = await this.configService.getServiceOptions("language");
        const traffickingStatus = await this.configService.getServiceOptions("trafficking_status");
        const legal = await this.configService.getServiceOptions("legal");
        const healthNeeds = await this.configService.getServiceOptions("health_needs");
        const medications = await this.configService.getServiceOptions("medications");
        const mentalHealthDiagnoses = await this.configService.getServiceOptions("mental_health_diagnoses");
        const physicalAccommodations = await this.configService.getServiceOptions("physical_accommodations");
        const smokingAllowed = await this.configService.getServiceOptions("smoking_allowed");
        const entryRequirements = await this.configService.getServiceOptions("entry_requirements");
        const serviceModel = await this.configService.getServiceOptions("service_model");
        const faithEngagement = await this.configService.getServiceOptions("faith_engagement");
        const serviceStructure = await this.configService.getServiceOptions("service_structure");
        const sleepingArrangement = await this.configService.getServiceOptions("sleeping_arrangement");
        const staffingLevel = await this.configService.getServiceOptions("staffing_level");
        const teamDiversity = await this.configService.getServiceOptions("team_diversity");
        const serviceGuidelines = await this.configService.getServiceOptions("service_guidelines");
        const supportProvided = await this.configService.getServiceOptions("support_provided");
        const supportOffered = await this.configService.getServiceOptions("support_offered");
        const advocateService = await this.configService.getAdvocateService();
        const state = await this.configService.getState();

        const rolesArray = Object.entries(roleMap).map(([name, id]) => ({ id, name }));
        const stateArray = state.map((item) => {
            return {
                id: item.id,
                name: item.name,
            }
        })
        const primaryPurposeArray = primaryPurpose.map((item) => {
            return {
                id: item.id,
                name: item.name,
            }
        })
        const platformPurposeArray = platformPurpose.map((item) => {
            return {
                id: item.id,
                name: item.name,
            }
        })
        const affiliationLicensesArray = affiliationLicenses.map((item) => {
            return {
                id: item.id,
                name: item.name,
            }
        })
        const serviceTypeArray = serviceTypes.map((item) => {
            return {
                id: item.id,
                name: item.name,
            }
        })
        const slotsBedsArray = slotsBeds.map((item) => {
            return {
                id: item.id,
                name: item.name,
            }
        })
        const gendersServedArray = gendersServed.map((item) => {
            return {
                id: item.id,
                name: item.name,
            }
        })
        const servedToArray = servedTo.map((item) => {
            return {
                id: item.id,
                name: item.name,
            }
        })
        const citizenshipArray = citizenship.map((item) => {
            return {
                id: item.id,
                name: item.name,
            }
        })
        const languageArray = language.map((item) => {
            return {
                id: item.id,
                name: item.name,
            }
        })
        const traffickingStatusArray = traffickingStatus.map((item) => {
            return {
                id: item.id,
                name: item.name,
            }
        })
        const legalArray = legal.map((item) => {
            return {
                id: item.id,
                name: item.name,
            }
        })
        const healthNeedsArray = healthNeeds.map((item) => {
            return {
                id: item.id,
                name: item.name,
            }
        })
        const medicationsArray = medications.map((item) => {
            return {
                id: item.id,
                name: item.name,
            }
        })
        const mentalHealthDiagnosesArray = mentalHealthDiagnoses.map((item) => {
            return {
                id: item.id,
                name: item.name,
            }
        })
        const physicalAccommodationsArray = physicalAccommodations.map((item) => {
            return {
                id: item.id,
                name: item.name,
            }
        })
        const smokingAllowedArray = smokingAllowed.map((item) => {
            return {
                id: item.id,
                name: item.name,
            }
        })
        const entryRequirementsArray = entryRequirements.map((item) => {
            return {
                id: item.id,
                name: item.name,
            }
        })
        const serviceModelArray = serviceModel.map((item) => {
            return {
                id: item.id,
                name: item.name,
            }
        })
        const faithEngagementArray = faithEngagement.map((item) => {
            return {
                id: item.id,
                name: item.name,
            }
        })
        const serviceStructureArray = serviceStructure.map((item) => {
            return {
                id: item.id,
                name: item.name,
            }
        })
        const sleepingArrangementArray = sleepingArrangement.map((item) => {
            return {
                id: item.id,
                name: item.name,
            }
        })
        const staffingLevelArray = staffingLevel.map((item) => {
            return {
                id: item.id,
                name: item.name,
            }
        })
        const teamDiversityArray = teamDiversity.map((item) => {
            return {
                id: item.id,
                name: item.name,
            }
        })
        const serviceGuidelinesArray = serviceGuidelines.map((item) => {
            return {
                id: item.id,
                name: item.name,
            }
        })
        const supportProvidedArray = supportProvided.map((item) => {
            return {
                id: item.id,
                name: item.name,
            }
        })
        const supportOfferedArray = supportOffered.map((item) => {
            return {
                id: item.id,
                name: item.name,
            }
        })
        const speakingAbilityArray = advocateService.map((item) => {
            if (item.type == "speaking_ability") {
                return {
                    id: item.id,
                    name: item.name,
                }
            }
        }).filter(Boolean);
        const raceEthnicityArray = advocateService.map((item) => {
            if (item.type == "race_ethnicity") {
                return {
                    id: item.id,
                    name: item.name,
                }
            }
        }).filter(Boolean);
        const citizenshipStatusArray = advocateService.map((item) => {
            if (item.type == "citizenship_status") {
                return {
                    id: item.id,
                    name: item.name,
                }
            }
        }).filter(Boolean);
        const birthdateStatusArray = advocateService.map((item) => {
            if (item.type == "birthdate_status") {
                return {
                    id: item.id,
                    name: item.name,
                }
            }
        }).filter(Boolean);

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
        }

        return ResponseFormatter.successResponse(res, "Configuration data", customResponse);
    }
}
