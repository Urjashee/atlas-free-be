import {Get, JsonController, Req, Res, UseBefore} from "routing-controllers";
import { Request, Response } from "express";
import { ConfigService } from "../services/Config.service";
import { ResponseFormatter } from "@inquitickets/response";
import {Constants, roleMap} from "../helper/Constants.helper";
import {
    Faith,
    Guidelines,
    StaffDiversity,
    Structure,
    SubstanceRecovery,
    TimePeriod
} from "../entity/ServiceDetails.entity";
import {DaysOfWeek, TimeZone} from "../entity/EmailReminder.entity";
import {authMiddleware} from "../middleware/Auth.middleware";
import {advocateMiddleware} from "../middleware/Advocate.middleware";
import {ServiceStatus} from "../entity/AssignedServices.entity";
import {OrganizationService} from "../services/Organization.service";

@JsonController("/api")
export class ConfigController {
    private configService = new ConfigService();
    private organizationService = new OrganizationService();

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
                icon: item.icon,
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
        const dayOfTheWeekArray = Object.keys(DaysOfWeek)
            .filter(key => isNaN(Number(key)))
            .map(key => ({
                id: DaysOfWeek[key as keyof typeof DaysOfWeek],
                name: key
            }));
        const timeZoneArray = Object.keys(TimeZone)
            .filter(key => isNaN(Number(key)))
            .map(key => ({
                id: TimeZone[key as keyof typeof TimeZone],
                name: key
            }));
        const structureArray = Object.keys(Structure)
            .filter(key => isNaN(Number(key)))
            .map(key => ({
                id: Structure[key as keyof typeof Structure],
                name: key
            }));
        const substanceRecoveryArray = Object.keys(SubstanceRecovery)
            .filter(key => isNaN(Number(key)))
            .map(key => ({
                id: SubstanceRecovery[key as keyof typeof SubstanceRecovery],
                name: key
            }));
        const faithArray = Object.keys(Faith)
            .filter(key => isNaN(Number(key)))
            .map(key => ({
                id: Faith[key as keyof typeof Faith],
                name: key
            }));
        const guidelinesArray = Object.keys(Guidelines)
            .filter(key => isNaN(Number(key)))
            .map(key => ({
                id: Guidelines[key as keyof typeof Guidelines],
                name: key
            }));
        const staffDiversityArray = Object.keys(StaffDiversity)
            .filter(key => isNaN(Number(key)))
            .map(key => ({
                id: StaffDiversity[key as keyof typeof StaffDiversity],
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
        }

        const language_text = {
            "landing_screen": {
                "sub_title": "So All Can Live in Freedom",
                "text": "Your work is vital for survivors’ recovery and support. Wayplace simplifies connecting with survivors, so you can achieve your mission."
            },
            "org_registration": {
                "sub_title": "A Safe Haven for Every Survivor",
                "text": "You are here to offer safety, support, and recovery to human trafficking survivors. We are here to connect you with survivors ready to choose your services, not because they have to, but because you are the best fit for them."
            },
            "org_login": {
                "sub_title": "From Exploitation to Empowerment",
                "text": "Connect with survivors who have hand-picked your organization. With our streamlined process, Wayplace helps you get to the work of recovery and empowerment for survivors."
            }
        }

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
            "language_text": language_text
        }

        return ResponseFormatter.successResponse(res, "Configuration data", customResponse);
    }

    @Get("/services")
    @UseBefore(authMiddleware)
    async getServiceList(@Req() req: Request, @Res() res: Response) {
        try {
            const page_number = parseInt(req.query.page_number as string) || Constants.PAGE_NUMBER;
            const page_size = parseInt(req.query.page_size as string) || Constants.PAGE_SIZE;
            const service_type = parseInt(req.query.service as string)
            const state = parseInt(req.query.state as string);
            const city = req.query.city as string;
            const zipcode = req.query.zipcode as string
            const availability = req.query.availability as string
            const structure = req.query.structure
            const children = req.query.children as string
            const staffing = parseInt(req.query.staffing as string)
            const substance = req.query.substance
            const faith = req.query.faith
            const living_arrangement = req.query.living_arrangement
            const guidelines = req.query.guidelines
            const staff_diversity = req.query.staff_diversity

            if (!service_type)
                return ResponseFormatter.errorResponse(res, 'Service type is required');
            const { data, total } = await this.organizationService.getServices(page_number, page_size,
                service_type, state, city, zipcode, availability, structure, staffing, substance, children,
                faith, living_arrangement, guidelines, staff_diversity);

            const customResponse = [];

            if (data.length > 0) {
                for (const service of data) {
                    let availability
                    const serviceType = await this.configService.getServiceOptionsById(service.service_type);
                    if (service.waitlist == false) {
                        if (service.slots_available <= 0) {
                            availability = 1 //Waitlist only
                        }
                    } else {
                        if (service.total_available_slots > service.slots_available) {
                            availability = 0 //Open
                        }
                        if (service.slots_available <= 0) {
                            availability = 2 //Waitlist only
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
                        availability: ServiceStatus[availability],
                    });
                }
            }

            return ResponseFormatter.successResponse(res, "Successful", {
                current_page: page_number,
                page_size,
                total_items: total,
                total_pages: Math.ceil(total / page_size),
                data: customResponse
            });
        } catch (error: any) {
            return ResponseFormatter.errorResponse(res, error.message || 'An error occurred');
        }
    }
}
