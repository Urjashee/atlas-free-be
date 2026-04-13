import Joi from "joi";

export const clientSchema = Joi.object({
    id: Joi.number(),
    organization_id: Joi.number(),
    service: Joi.array().items(Joi.number()).min(1).required(),
    client_nick_name: Joi.string().optional().allow(""),
    zipcode: Joi.string().min(5).max(10).required(),
    dob: Joi.date().required(),
    english_speaking_ability: Joi.number().required(),
    preferred_language: Joi.string().optional().allow(""),
    gender: Joi.array().items(Joi.number()).min(1).required(),
    race: Joi.array().items(Joi.number()).min(1).required(),
    citizenship_status: Joi.number().required(),
    client_experienced: Joi.array().items(Joi.number()).min(1).required(),
    pregnant: Joi.boolean().default(false).required(),
    pregnant_months: Joi.number()
        .when('pregnant', {
            is: true,
            then: Joi.required(),
            otherwise: Joi.optional()
        }).allow(null).empty(""),
    birthdate_status: Joi.number().allow(null).empty(""),
    children_accompany: Joi.number().required(),
    children_to_accompany: Joi.number().optional().empty(""),
    ages_of_children: Joi.string().optional().empty(""),
    criteria: Joi.array().items(Joi.number()).min(1).required(),
    criteria_add: Joi.array().items(Joi.number()).optional(),
    medications: Joi.array().items(Joi.number()).min(1).required(),
    medications_other: Joi.string().allow(null).empty("").optional(),
    mental_health_diagnoses: Joi.array().items(Joi.number()).min(1).required(),
    mental_health_diagnoses_other: Joi.string().allow(null).empty("").optional(),
    physical_accommodation: Joi.array().items(Joi.number()).min(1).required(),
    nicotine_products: Joi.array().items(Joi.number()).min(1).required(),
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
