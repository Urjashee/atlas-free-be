"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.removeClient = exports.removeUser = void 0;
const joi_1 = __importDefault(require("joi"));
exports.removeUser = joi_1.default.object({
    organization_id: joi_1.default.number(),
    user_id: joi_1.default.number(),
    service_id: joi_1.default.number(),
    // email: Joi.string().email().pattern(/^\S+$/).required(),
});
exports.removeClient = joi_1.default.object({
    organization_id: joi_1.default.number(),
    user_id: joi_1.default.number(),
    client_id: joi_1.default.number(),
    role_id: joi_1.default.number(),
    // email: Joi.string().email().pattern(/^\S+$/).required(),
});
