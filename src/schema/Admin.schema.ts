import Joi from "joi";

export const removeUser = Joi.object({
    organization_id: Joi.number(),
    user_id: Joi.number(),
    service_id: Joi.number(),
    // email: Joi.string().email().pattern(/^\S+$/).required(),
})

export const removeClient = Joi.object({
    organization_id: Joi.number(),
    user_id: Joi.number(),
    client_id: Joi.number(),
    role_id: Joi.number(),
    // email: Joi.string().email().pattern(/^\S+$/).required(),
})
