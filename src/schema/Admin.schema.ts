import Joi from "joi";

export const removeUser = Joi.object({
    organization_id: Joi.number(),
    user_id: Joi.number(),
    service_id: Joi.number(),
    email: Joi.string().email().pattern(/^\S+$/).required(),
})
