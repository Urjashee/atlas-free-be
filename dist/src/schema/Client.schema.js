"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.survivorSchema = exports.clientSchema = void 0;
const joi_1 = __importDefault(require("joi"));
exports.clientSchema = joi_1.default.object({
    id: joi_1.default.number(),
    organization_id: joi_1.default.number(),
    service: joi_1.default.array().items(joi_1.default.number()),
    client_nick_name: joi_1.default.string(),
    zipcode: joi_1.default.string().min(5).max(10),
    dob: joi_1.default.date(),
    english_speaking_ability: joi_1.default.number(),
    preferred_language: joi_1.default.string(),
    gender: joi_1.default.array().items(joi_1.default.number()),
    race: joi_1.default.array().items(joi_1.default.number()),
    citizenship_status: joi_1.default.number(),
    client_experienced: joi_1.default.array().items(joi_1.default.number()),
    pregnant: joi_1.default.boolean(),
    pregnant_months: joi_1.default.number(),
    birthdate_status: joi_1.default.number(),
    children_accompany: joi_1.default.number(),
    children_to_accompany: joi_1.default.number(),
    criteria: joi_1.default.array().items(joi_1.default.number()),
    criteria_add: joi_1.default.array().items(joi_1.default.number()),
    medications: joi_1.default.array().items(joi_1.default.number()),
    mental_health_diagnoses: joi_1.default.array().items(joi_1.default.number()),
    physical_accommodation: joi_1.default.array().items(joi_1.default.number()),
    nicotine_products: joi_1.default.array().items(joi_1.default.number()),
    specify_physical_accommodation: joi_1.default.string(),
});
exports.survivorSchema = joi_1.default.object({
    id: joi_1.default.number(),
    client_id: joi_1.default.number(),
    service: joi_1.default.array().items(joi_1.default.number()),
    zipcode: joi_1.default.string().min(5).max(10),
    dob: joi_1.default.date(),
    english_speaking_ability: joi_1.default.number(),
    gender: joi_1.default.array().items(joi_1.default.number()),
    citizenship_status: joi_1.default.number(),
    client_experienced: joi_1.default.array().items(joi_1.default.number()),
    pregnant: joi_1.default.boolean(),
    pregnant_months: joi_1.default.number(),
    birthdate_status: joi_1.default.number(),
    children_accompany: joi_1.default.number(),
    children_to_accompany: joi_1.default.number(),
    criteria: joi_1.default.array().items(joi_1.default.number()),
});
