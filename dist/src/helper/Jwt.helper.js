"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.JwtHelper = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const Constants_helper_1 = require("./Constants.helper");
class JwtHelper {
    jwtSign(user, organization) {
        return __awaiter(this, void 0, void 0, function* () {
            if (user.role.id == Constants_helper_1.Constants.ROLE_ADMIN) {
                return jsonwebtoken_1.default.sign({
                    id: user.id,
                    email: user.email,
                    role: user.role.id,
                    title: user.title,
                    first_name: user.first_name,
                    last_name: user.last_name,
                    isActive: user.is_active,
                    isStatus: user.is_status,
                    isProfile: user.is_profile,
                }, process.env.JWT_SECRET, { expiresIn: process.env.TOKEN_EXPIRY });
            }
            if (user.role.id == Constants_helper_1.Constants.ROLE_ORGANIZATION_ADMIN) {
                return jsonwebtoken_1.default.sign({
                    id: user.id,
                    email: user.email,
                    role: user.role.id,
                    title: user.title,
                    first_name: user.first_name,
                    last_name: user.last_name,
                    organization_id: organization.id,
                    organization_name: organization.name,
                    isActive: user.is_active,
                    isStatus: user.is_status,
                    isProfile: user.is_profile,
                }, process.env.JWT_SECRET, { expiresIn: process.env.TOKEN_EXPIRY });
            }
            if (user.role.id == Constants_helper_1.Constants.ROLE_SERVICE_MANAGER) {
                return jsonwebtoken_1.default.sign({
                    id: user.id,
                    email: user.email,
                    role: user.role.id,
                    title: user.title,
                    first_name: user.first_name,
                    last_name: user.last_name,
                    organization_id: organization.id,
                    organization_name: organization.name,
                    isActive: user.is_active,
                    isStatus: user.is_status,
                    isProfile: user.is_profile,
                }, process.env.JWT_SECRET, { expiresIn: process.env.TOKEN_EXPIRY });
            }
            if (user.role.id == Constants_helper_1.Constants.ROLE_ADVOCATE) {
                return jsonwebtoken_1.default.sign({
                    id: user.id,
                    email: user.email,
                    role: user.role.id,
                    title: user.title,
                    first_name: user.first_name,
                    last_name: user.last_name,
                    organization_id: organization.id,
                    organization_name: organization.name,
                    isActive: user.is_active,
                    isStatus: user.is_status,
                    isProfile: user.is_profile,
                }, process.env.JWT_SECRET, { expiresIn: process.env.TOKEN_EXPIRY });
            }
            if (user.role.id == Constants_helper_1.Constants.ROLE_SURVIVOR) {
                return jsonwebtoken_1.default.sign({
                    id: user.id,
                    email: user.email,
                    role: user.role.id,
                    isActive: user.is_active,
                    isStatus: user.is_status,
                    isProfile: user.is_profile,
                }, process.env.JWT_SECRET, { expiresIn: process.env.TOKEN_EXPIRY });
            }
        });
    }
}
exports.JwtHelper = JwtHelper;
