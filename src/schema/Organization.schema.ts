import Joi from "joi";

export const reportSchema = Joi.object({
    type: Joi.string().valid('survivor', 'advocate').required(),
    reported_user: Joi.number().required(),
    reason: Joi.string().required(),
})
export const sendInvitationSchema = Joi.object({
    email: Joi.string().email().pattern(/^\S+$/).required(),
    role: Joi.number().required()
})
