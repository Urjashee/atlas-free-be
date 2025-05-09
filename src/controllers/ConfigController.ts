import { Get, JsonController, Req, Res } from "routing-controllers";
import { Request, Response } from "express";
import { ConfigService } from "../services/ConfigService";
import { ResponseFormatter } from "@inquitickets/response";
import {Constants, roleMap} from "../helper/Constants";
import {TimePeriod} from "../entity/OrganizationDetails.entity";

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

        const rolesArray = Object.entries(roleMap).map(([name, id]) => ({ id, name }));
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
            "Roles": rolesArray,
            "Primary purpose": primaryPurposeArray,
            "Platform purpose": platformPurposeArray,
            "Affiliation and Licenses": affiliationLicensesArray,
            "Service type": serviceTypeArray,
            "Slot beds": slotsBedsArray,
            "Time Period": timePeriodArray,
            "Genders served": gendersServedArray,
            "Served to": servedToArray,
            "Citizenship requirements": citizenshipArray,
            "Language": languageArray,
            "Traffic status": traffickingStatusArray,
            "Legal": legalArray,
            "Health needs": healthNeedsArray,
            "Medications": medicationsArray,
            "Mental health diagnoses": mentalHealthDiagnosesArray,
            "Physical accommodation": physicalAccommodationsArray,
            "Smoking allowed": smokingAllowedArray,
            "Entry requirement": entryRequirementsArray,
            "Service model": serviceModelArray,
            "Faith engagement": faithEngagementArray,
            "Service structure": serviceStructureArray,
            "Sleeping arrangement": sleepingArrangementArray,
            "Staffing level": staffingLevelArray,
            "Team diversity": teamDiversityArray,
            "Service guideline": serviceGuidelinesArray,
            "Support provided": supportProvidedArray,
            "Support offered": supportOfferedArray,
            "Speaking ability": speakingAbilityArray,
            "Race ethnicity": raceEthnicityArray,
            "Citizenship status": citizenshipStatusArray,
            "Birthdate status": birthdateStatusArray,
        }

        return ResponseFormatter.successResponse(res, "Configuration data", customResponse);
    }
}
