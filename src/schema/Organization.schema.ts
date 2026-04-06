import Joi from "joi";

export const reportSchema = Joi.object({
    organization_id: Joi.number(),
    type: Joi.string().valid('survivor', 'advocate').required(),
    reported_user: Joi.number().optional().allow(""),
    reason: Joi.string().required(),
    client_service_id: Joi.number().optional().allow(""),
})
export const sendInvitationSchema = Joi.object({
    organization_id: Joi.number().optional().allow(""),
    email: Joi.string().email().pattern(/^\S+$/).required(),
    role: Joi.number().required()
})
export const emailReminderSchema = Joi.object({
    id: Joi.number().optional(),
    email: Joi.string().email().required(),
    day_of_week: Joi.required(),
    time: Joi.string()
        .pattern(/^([0-1]\d|2[0-3]):([0-5]\d)$/) // HH:MM 24-hour format
        .required(),
    time_zone: Joi.string().required()
});

export const serviceSettingsSchema = Joi.object({
    organization_id: Joi.number(),
    service_id: Joi.number().required(),
    available_slots: Joi.number().required(),
    service_manager: Joi.array().items(Joi.string()).required(),
    contact_email: Joi.string().required(),
    contact_phone: Joi.number().required(),
    emailReminders: Joi.array().items(emailReminderSchema).optional()
})

export const reportServiceSchema = Joi.object({
    service_request_id: Joi.number().required(),
    reason: Joi.string().required(),
});

export const assignServiceSchema = Joi.object({
    organization_id: Joi.number().optional(),
    service_id: Joi.number().required(),
    service_manager_id: Joi.number().required(),
});
