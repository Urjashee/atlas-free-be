import {Get, JsonController, Param, Post, Req, Res, UseBefore} from "routing-controllers";
import {UserService} from "../services/UserService";
import {OrganizationService} from "../services/OrganizationService";
import {ConfigService} from "../services/ConfigService";
import {authMiddleware} from "../middleware/authMiddleware";
import {Request, Response} from "express";
import {ResponseFormatter} from "../helper/ResponseFormatter";
import Joi from "joi";
import {organizationMiddleware} from "../middleware/organizationMiddleware";
import {TimePeriod} from "../entity/OrganizationDetails.entity";

const clientSlots = Joi.object({
    id: Joi.number(),
    name: Joi.string().required(),
    service_type: Joi.number(),
    client_slots: Joi.number(),
    slots_beds: Joi.number(),
    start_day_of_service: Joi.date(),
    service_limited: Joi.boolean(),
    enrollment_type: Joi.number(),
    enrollment_period: Joi.number(),
    extension: Joi.boolean(),
    waitlist: Joi.boolean(),
    service_description: Joi.string(),
    minimum_age: Joi.number(),
    maximum_age: Joi.number(),
    genders_served: Joi.array().items(Joi.number()),
    served_to: Joi.array().items(Joi.number()),
    minimum_children_age: Joi.number(),
    maximum_children_age: Joi.number(),
    maximum_children_intake: Joi.number(),
    citizenship_requirement: Joi.array().items(Joi.number()),
    language_requirement: Joi.array().items(Joi.number()),
    out_of_state_relocation: Joi.boolean(),
    trafficking_status: Joi.array().items(Joi.number()),
    legal: Joi.array().items(Joi.number()),
    health_needs: Joi.array().items(Joi.number()),
    medications: Joi.array().items(Joi.number()),
    mental_health_diagnoses: Joi.array().items(Joi.number()),
    physical_accommodations: Joi.array().items(Joi.number()),
    smoking_allowed: Joi.array().items(Joi.number()),
    entry_requirement: Joi.array().items(Joi.number()),
    days_sober: Joi.string(),
    service_model: Joi.array().items(Joi.number()),
    faith_engagement: Joi.number(),
    faith_engagement_practice: Joi.string(),
    service_structure: Joi.number(),
    sleeping_arrangement: Joi.number(),
    staffing_level: Joi.number(),
    teams_diversity: Joi.array().items(Joi.number()),
    service_guidelines: Joi.array().items(Joi.number()),
    support_provided: Joi.array().items(Joi.number()),
    support_offered: Joi.array().items(Joi.number()),
    intake_process: Joi.string(),
    additional_requirements: Joi.string(),
    reason_for_removal: Joi.string(),
    is_submitted: Joi.boolean().required(),
});

@JsonController("/api/organization")
export class AuthController {
    private userService = new UserService();
    private organizationService = new OrganizationService();
    private configService = new ConfigService();

    @Post("/services")
    @UseBefore(authMiddleware)
    @UseBefore(organizationMiddleware)
    async addOrganization(@Req() req: Request, @Res() res: Response) {
        try {
            if (!req.body) {
                return ResponseFormatter.errorResponse(res, 'Request body is undefined.');
            }
            const {error} = clientSlots.validate(req.body);
            if (error) {
                return ResponseFormatter.errorResponse(res, error.details[0].message);
            }

            if (req.body.id) {
                const checkIfValidOrganization = await this.organizationService.checkIfValidOrganization(req.body.id, req.user.id);
                if (!checkIfValidOrganization)
                    return ResponseFormatter.errorResponse(res, 'Invalid service');
                const settings = await this.organizationService.editOrganizationSettings(req.body.id, req.user.id, req.body)
                if (!settings)
                    return ResponseFormatter.errorResponse(res, "Can't edit, try again later");
            } else {
                const settings = await this.organizationService.addOrganizationSettings(req.user.id, req.body)
                if (!settings)
                    return ResponseFormatter.errorResponse(res, "Can't add, try again later");
            }
            return ResponseFormatter.successResponse(res, "Successful");
        } catch (error: any) {
            return ResponseFormatter.errorResponse(res, error.message || 'An error occurred');
        }
    }


    @Get("/services")
    @UseBefore(authMiddleware)
    @UseBefore(organizationMiddleware)
    async getOrganizations(@Req() req: Request, @Res() res: Response) {
        try {
            const getOrganizationServices = await this.organizationService.getOrganizationsService(req.user.id);
            const customResponse = await Promise.all(
                getOrganizationServices.map(async (service) => {
                    return {
                        id: service.id,
                        name: service.name,
                        service_type_id: service.service_type,
                        service_type: (await this.configService.getServiceOptionsById(service.service_type)).name,
                        slots_beds: (await this.configService.getServiceOptionsById(service.slots_beds)).name,
                        client_slots: service.client_slots,
                        client_slots_available: service.client_slots_available,
                        start_day_of_service: new Date(service.start_day_of_service).toISOString().split('T')[0],
                        service_limited: service.service_limited,
                        enrollment_type: TimePeriod[service.enrollment_type], // Get data from enum
                        enrollment_period: service.enrollment_period,
                        extension: service.extension,
                        waitlist: service.waitlist,
                        service_description: service.service_description,
                        minimum_age: service.minimum_age,
                        maximum_age: service.maximum_age,
                        genders_served: await Promise.all(service.genders_served.map(async (item) => {
                            return {
                                id: item,
                                name: (await this.configService.getServiceOptionsById(item)).name
                            }
                        })),
                        served_to: await Promise.all(service.served_to.map(async (item) => {
                            return {
                                id: item,
                                name: (await this.configService.getServiceOptionsById(item)).name
                            }
                        })),
                        minimum_children_age: service.minimum_children_age,
                        maximum_children_age: service.maximum_children_age,
                        maximum_children_intake: service.maximum_children_intake,
                        citizenship_requirement: await Promise.all(service.citizenship_requirement.map(async (item) => {
                            return {
                                id: item,
                                name: (await this.configService.getServiceOptionsById(item)).name
                            }
                        })),
                        language_requirement: await Promise.all(service.language_requirement.map(async (item) => {
                            return {
                                id: item,
                                name: (await this.configService.getServiceOptionsById(item)).name
                            }
                        })),
                        out_of_state_relocation: service.out_of_state_relocation,
                        trafficking_status: await Promise.all(service.trafficking_status.map(async (item) => {
                            return {
                                id: item,
                                name: (await this.configService.getServiceOptionsById(item)).name
                            }
                        })),
                        legal: await Promise.all(service.legal.map(async (item) => {
                            return {
                                id: item,
                                name: (await this.configService.getServiceOptionsById(item)).name
                            }
                        })),
                        health_needs: await Promise.all(service.health_needs.map(async (item) => {
                            return {
                                id: item,
                                name: (await this.configService.getServiceOptionsById(item)).name
                            }
                        })),
                        medications: await Promise.all(service.medications.map(async (item) => {
                            return {
                                id: item,
                                name: (await this.configService.getServiceOptionsById(item)).name
                            }
                        })),
                        mental_health_diagnoses: await Promise.all(service.mental_health_diagnoses.map(async (item) => {
                            return {
                                id: item,
                                name: (await this.configService.getServiceOptionsById(item)).name
                            }
                        })),
                        physical_accommodations: await Promise.all(service.physical_accommodations.map(async (item) => {
                            return {
                                id: item,
                                name: (await this.configService.getServiceOptionsById(item)).name
                            }
                        })),
                        smoking_allowed: await Promise.all(service.smoking_allowed.map(async (item) => {
                            return {
                                id: item,
                                name: (await this.configService.getServiceOptionsById(item)).name
                            }
                        })),
                        entry_requirement: await Promise.all(service.entry_requirement.map(async (item) => {
                            return {
                                id: item,
                                name: (await this.configService.getServiceOptionsById(item)).name
                            }
                        })),
                        days_sober: service.days_sober,
                        service_model: await Promise.all(service.service_model.map(async (item) => {
                            return {
                                id: item,
                                name: (await this.configService.getServiceOptionsById(item)).name
                            }
                        })),
                        "faith_engagement": (await this.configService.getServiceOptionsById(service.faith_engagement)).name,
                        "faith_engagement_practice": service.faith_engagement_practice,
                        "service_structure": (await this.configService.getServiceOptionsById(service.service_structure)).name,
                        "sleeping_arrangement": (await this.configService.getServiceOptionsById(service.sleeping_arrangement)).name,
                        "staffing_level": (await this.configService.getServiceOptionsById(service.staffing_level)).name,
                        "teams_diversity": await Promise.all(service.teams_diversity.map(async (item) => {
                            return {
                                id: item,
                                name: (await this.configService.getServiceOptionsById(item)).name
                            }
                        })),
                        "service_guidelines": await Promise.all(service.service_guidelines.map(async (item) => {
                            return {
                                id: item,
                                name: (await this.configService.getServiceOptionsById(item)).name
                            }
                        })),
                        "support_provided": await Promise.all(service.support_provided.map(async (item) => {
                            return {
                                id: item,
                                name: (await this.configService.getServiceOptionsById(item)).name
                            }
                        })),
                        "support_offered": await Promise.all(service.support_offered.map(async (item) => {
                            return {
                                id: item,
                                name: (await this.configService.getServiceOptionsById(item)).name
                            }
                        })),
                        intake_process: service.intake_process,
                        additional_requirements: service.additional_requirements,
                        reason_for_removal: service.reason_for_removal,
                        is_submitted: service.is_submitted,
                    };
                })
            );
            return ResponseFormatter.successResponse(res, "Successful", customResponse);
        } catch (error: any) {
            return ResponseFormatter.errorResponse(res, error.message || 'An error occurred');
        }
    }
}
