import Joi from "joi";

export const clientSchema = Joi.object({
    id: Joi.number(),
    organization_id: Joi.number(),
    service: Joi.array().items(Joi.number()),
    client_nick_name: Joi.string().optional().allow(""),
    zipcode: Joi.string().min(5).max(10),
    dob: Joi.date(),
    english_speaking_ability: Joi.number(),
    preferred_language: Joi.string().optional().allow(""),
    gender: Joi.array().items(Joi.number()).optional(),
    race: Joi.array().items(Joi.number()),
    citizenship_status: Joi.number(),
    client_experienced: Joi.array().items(Joi.number()).optional(),
    pregnant: Joi.boolean().default(false),
    pregnant_months: Joi.number()
        .when('pregnant', {
            is: true,
            then: Joi.required(),
            otherwise: Joi.optional()
        }).allow(null).empty(""),
    birthdate_status: Joi.number().allow(null).empty("").optional(),
    children_accompany: Joi.number().optional(),
    children_to_accompany: Joi.number().optional().empty(""),
    ages_of_children: Joi.string().optional().empty(""),
    criteria: Joi.array().items(Joi.number()).optional(),
    criteria_add: Joi.array().items(Joi.number()).optional(),
    medications: Joi.array().items(Joi.number()),
    medications_other: Joi.string().allow(null).empty("").optional(),
    mental_health_diagnoses: Joi.array().items(Joi.number()),
    mental_health_diagnoses_other: Joi.string().allow(null).empty("").optional(),
    physical_accommodation: Joi.array().items(Joi.number()),
    nicotine_products: Joi.array().items(Joi.number()),
    specify_physical_accommodation: Joi.string().optional().allow(""),
})

export const survivorSchema = Joi.object({
    id: Joi.number(),
    client_id: Joi.number(),
    service: Joi.array().items(Joi.number()),
    zipcode: Joi.string().min(5).max(10),
    dob: Joi.date(),
    english_speaking_ability: Joi.number(),
    gender: Joi.string().optional().allow(""),
    citizenship_status: Joi.number(),
    client_experienced: Joi.array().items(Joi.number()),
    pregnant: Joi.boolean(),
    pregnant_months: Joi.number(),
    birthdate_status: Joi.number().optional(),
    children_accompany: Joi.number(),
    children_to_accompany: Joi.number().optional(),
    criteria: Joi.array().items(Joi.number()),
})
