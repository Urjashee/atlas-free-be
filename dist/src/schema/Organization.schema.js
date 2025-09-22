"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.serviceSettingsSchema = exports.emailReminderSchema = exports.sendInvitationSchema = exports.reportSchema = void 0;
const joi_1 = __importDefault(require("joi"));
exports.reportSchema = joi_1.default.object({
    organization_id: joi_1.default.number(),
    type: joi_1.default.string().valid('survivor', 'advocate').required(),
    reported_user: joi_1.default.number().required(),
    reason: joi_1.default.string().required(),
});
exports.sendInvitationSchema = joi_1.default.object({
    email: joi_1.default.string().email().pattern(/^\S+$/).required(),
    role: joi_1.default.number().required()
});
exports.emailReminderSchema = joi_1.default.object({
    id: joi_1.default.number().optional(),
    email: joi_1.default.string().email().required(),
    day_of_week: joi_1.default.required(),
    time: joi_1.default.string()
        .pattern(/^([0-1]\d|2[0-3]):([0-5]\d)$/) // HH:MM 24-hour format
        .required(),
    time_zone: joi_1.default.string().required()
});
exports.serviceSettingsSchema = joi_1.default.object({
    organization_id: joi_1.default.number(),
    service_id: joi_1.default.number().required(),
    available_slots: joi_1.default.number().required(),
    service_manager: joi_1.default.array().items(joi_1.default.string()).required(),
    contact_email: joi_1.default.string().required(),
    contact_phone: joi_1.default.number().required(),
    emailReminders: joi_1.default.array().items(exports.emailReminderSchema).min(1).required()
});
