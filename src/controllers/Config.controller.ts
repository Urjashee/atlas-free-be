import {Get, JsonController, Post, Req, Res, UseBefore} from "routing-controllers";
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
        const legalArraySurvivor = legal.map((item) => {
            let updatedName = item.name;
            if (item.id === 32) {
                updatedName = "have an abuser actively looking for you";
            }

            if (item.id === 40) {
                updatedName = "are registered as a sex offender";
            }
            return {
                id: item.id,
                name: updatedName,
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
        const physicalAccommodationsArray = [
            ...physicalAccommodations
                .filter(item => ![87, 171, 174, 175].includes(item.id))
                .map(item => ({
                    id: item.id,
                    name: item.name,
                })),

            // Add these before None and Other
            ...physicalAccommodations
                .filter(item => [174, 175].includes(item.id))
                .map(item => ({
                    id: item.id,
                    name: item.name,
                })),

            // None
            ...physicalAccommodations
                .filter(item => item.id === 87)
                .map(item => ({
                    id: item.id,
                    name: item.name,
                })),

            // Other
            ...physicalAccommodations
                .filter(item => item.id === 171)
                .map(item => ({
                    id: item.id,
                    name: item.name,
                })),
        ];
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
            "faith_based": faithArray,
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
            "legal_survivor": legalArraySurvivor,
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
            const service_type = req.query.service
            const state = parseInt(req.query.state as string);
            const city = req.query.city as string;
            const zipcode = req.query.zipcode as string
            const availability = req.query.availability as string
            // const structure = req.query.structure
            const children = req.query.children as string

            const substance = req.query.substance_recovery
            const faith = req.query.faith_based
            const dob = req.query.dob

            const dobDate = dob ? new Date(dob as string) : null;
            const age = dobDate ? Math.floor((Date.now() - dobDate.getTime()) / (365.25 * 24 * 60 * 60 * 1000)) : null;

            const pregnant = req.query.pregnant as string;
            const children_accompany = req.query.children_accompany as string;
            const language = req.query.language ? parseInt(req.query.language as string) : null;

            const genderRaw = req.query.gender;
            const gender = Array.isArray(genderRaw)
                ? genderRaw.map(Number)
                : genderRaw
                    ? [Number(genderRaw)]
                    : [];

            const medicationsRaw = req.query.medications;
            const medications = Array.isArray(medicationsRaw)
                ? medicationsRaw.map(Number)
                : medicationsRaw
                    ? [Number(medicationsRaw)]
                    : [];

            const mentalHealthRaw = req.query.mental_health;
            const mental_health = Array.isArray(mentalHealthRaw)
                ? mentalHealthRaw.map(Number)
                : mentalHealthRaw
                    ? [Number(mentalHealthRaw)]
                    : [];

            const physicalAccommodationsRaw = req.query.physical_accommodations;
            const physical_accommodations = Array.isArray(physicalAccommodationsRaw)
                ? physicalAccommodationsRaw.map(Number)
                : physicalAccommodationsRaw
                    ? [Number(physicalAccommodationsRaw)]
                    : [];

            const structureRaw = req.query.structure;
            const structure = Array.isArray(structureRaw)
                ? structureRaw.map(Number)
                : structureRaw
                    ? [Number(structureRaw)]
                    : [];

            const staffingRaw = req.query.staffing_level;
            const staffing = Array.isArray(staffingRaw)
                ? staffingRaw.map(Number)
                : staffingRaw
                    ? [Number(staffingRaw)]
                    : [];

            const livingArrangementRaw = req.query.living_arrangement;
            const living_arrangement = Array.isArray(livingArrangementRaw)
                ? livingArrangementRaw.map(Number)
                : livingArrangementRaw
                    ? [Number(livingArrangementRaw)]
                    : [];

            const guidelinesRaw = req.query.guidelines;
            const guidelines = Array.isArray(guidelinesRaw)
                ? guidelinesRaw.map(Number)
                : guidelinesRaw
                    ? [Number(guidelinesRaw)]
                    : [];

            const staffDiversityRaw = req.query.staff_diversity;
            const staff_diversity = Array.isArray(staffDiversityRaw)
                ? staffDiversityRaw.map(Number)
                : staffDiversityRaw
                    ? [Number(staffDiversityRaw)]
                    : [];

            if (!service_type)
                return ResponseFormatter.errorResponse(res, 'Service type is required');
            // console.log("Service type", service_type);
            const { data, total } = await this.organizationService.getServices(page_number, page_size,
                service_type, state, city, zipcode, availability, structure, staffing, substance, children,
                faith, living_arrangement, guidelines, staff_diversity,
                age, gender, pregnant, children_accompany, language, medications, mental_health, physical_accommodations);

            const customResponse = [];

            if (data.length > 0) {
                for (const service of data) {
                    let availability
                    const serviceType = await this.configService.getServiceOptionsById(service.service_type);
                    if (service.waitlist == false) {
                        if (service.slots_available <= 0) {
                            availability = 1 //Full
                        }
                        if (service.slots_available > 0) {
                            availability = 0 //Open
                        }
                    } else {
                        if (service.slots_available > 0) {
                            availability = 0 //Open
                        }
                        if (service.slots_available <= 0) {
                            availability = 2 //Waitlist only
                        }
                    }


                    customResponse.push({
                        id: service.id,
                        name: service.name,
                        organization_id: service.organization.id,
                        organization_name: service.organization.name,
                        is_organization_address: service.is_organization_address,
                        service_type_id: serviceType.id,
                        service_type: serviceType.name,
                        service_type_icon: serviceType.icon,
                        address: (!service.disclose_address === false || (!service.is_organization_address === false && !service.organization.disclose_address === false))
                            ? `${service.is_organization_address ? (service.organization.zipcode || "") : (service.zipcode || "")}`
                            : service.is_organization_address
                                ? `${service.organization.street || ""} ${service.organization.city || ""}, ${service.organization.state?.name || ""} ${service.organization.zipcode || ""}`
                                : `${service.street || ""} ${service.city || ""}, ${service?.state?.name || ""} ${service.zipcode || ""}`,
                        availability_id: availability,
                        availability: ServiceStatus[availability],
                        waitlist: service.waitlist,
                        total_available_slots: service.total_available_slots,
                        slots_available: service.slots_available,
                        state_id: service.is_organization_address
                            ? (service.organization.state?.id || "")
                            : (service?.state?.id || ""),
                        service_staffing: service.staffing_level || "",
                        // served_to: service.served_to,
                        service_structure: service.service_structure || "",
                        staffing_level: service.staffing_level || "",
                        entry_requirement: service.entry_requirement || "",
                        staff_diversity: service.teams_diversity || "",
                        living_arrangement: service.sleeping_arrangement || "",
                        faith: service.faith_engagement || "",
                        staffing_guideline: service.service_guidelines || "",
                        service_model: service.service_model || "",
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

    @Post("/service-setting-email")
    async service_setting_email(@Req() req: Request, @Res() res: Response) {
        try {
            const apiKey = req.headers["x-api-key"];
            if (apiKey !== process.env.INTERNAL_API_KEY) {
                return res.status(401).json({ message: "Unauthorized" });
            }

            const services = await this.configService.getAllActiveServices();

            if (!services || services.length === 0) {
                return ResponseFormatter.errorResponse(res, 'No services found');
            }

            const results = await Promise.allSettled(
                services.map(service =>
                    this.configService.sendSettingEmail(
                        service.contact_email,
                        service.name
                    )
                )
            )
            const formattedResults = results.map((result, index) => ({
                email: services[index].contact_email,
                status: result.status,
                error: result.status === 'rejected' ? result.reason?.message : null
            }));
            return ResponseFormatter.successResponse(res, "Successful", formattedResults)
        } catch (error: any) {
            return ResponseFormatter.errorResponse(res, error.message || 'An error occurred');
        }
    }
}
