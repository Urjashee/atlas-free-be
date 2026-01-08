import Joi from "joi";

export const servicesSchema = Joi.object({
    id: Joi.number().allow(null).optional(),
    organization_id: Joi.number().allow(null).optional(),

    name: Joi.string().allow("").required(),

    street: Joi.string().allow("").optional(),
    address: Joi.string().allow("").optional(),
    city: Joi.string().allow("").optional(),

    state: Joi.number().allow(null).empty("").optional(),
    zipcode: Joi.string().allow("").optional(),

    disclose_address: Joi.boolean().required(),
    is_organization_address: Joi.boolean().default(false),

    service_type: Joi.number().allow(null).empty("").optional(),
    total_available_slots: Joi.number().allow(null).empty("").optional(),
    slots_beds: Joi.number().allow(null).empty("").optional(),

    start_day_of_service: Joi.date().allow(null).optional(),

    service_limited: Joi.boolean().default(false),
    enrollment_type: Joi.number().allow(null).empty("").optional(),
    enrollment_period: Joi.number().allow(null).empty("").optional(),

    extension: Joi.boolean().default(false),
    waitlist: Joi.boolean().default(false),

    service_description: Joi.string().allow("").optional(),

    minimum_age: Joi.number().allow(null).empty("").optional(),
    maximum_age: Joi.number().allow(null).empty("").optional(),

    genders_served: Joi.array().items().optional(),
    served_to: Joi.array().items().optional(),

    minimum_children_age: Joi.number().allow(null).empty("").optional(),
    maximum_children_age: Joi.number().allow(null).empty("").optional(),
    maximum_children_intake: Joi.number().allow(null).empty("").optional(),

    citizenship_requirement: Joi.array().items().optional(),
    language_requirement: Joi.array().items().optional(),

    out_of_state_relocation: Joi.boolean().default(false),

    trafficking_status: Joi.array().items().optional(),
    legal: Joi.array().items().optional(),
    health_needs: Joi.array().items().optional(),
    medications: Joi.array().items().optional(),
    mental_health_diagnoses: Joi.array().items().optional(),
    physical_accommodations: Joi.array().items().optional(),
    smoking_allowed: Joi.array().items().optional(),
    entry_requirement: Joi.array().items().optional(),

    days_sober: Joi.string().allow("").optional(),

    service_model: Joi.array().items().optional(),

    faith_engagement: Joi.number().allow(null).empty("").optional(),
    faith_engagement_practice: Joi.string().allow("").optional(),

    service_structure: Joi.number().allow(null).empty("").optional(),
    sleeping_arrangement: Joi.number().allow(null).empty("").optional(),
    staffing_level: Joi.number().allow(null).empty("").optional(),

    teams_diversity: Joi.array().items().optional(),
    service_guidelines: Joi.array().items().optional(),
    support_provided: Joi.array().items().optional(),
    support_offered: Joi.array().items().optional(),

    intake_process: Joi.string().allow("").optional(),
    additional_requirements: Joi.string().allow("").optional(),
    reason_for_removal: Joi.string().allow("").optional(),

    is_submitted: Joi.boolean().default(false),
});

export const clientServiceSchema = Joi.object({
    organization_id: Joi.number().required(),
    user_id: Joi.number().required(),
    client_service_id: Joi.number().required(),
    service_id: Joi.number().required(),
});

export const removeUserSchema = Joi.object({
    organization_id: Joi.number().required(),
    user_id: Joi.number().required(),
    email: Joi.string().email().required(),
})
