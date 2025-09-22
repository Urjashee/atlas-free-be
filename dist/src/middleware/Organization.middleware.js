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
exports.organizationMiddleware = void 0;
const dotenv_1 = __importDefault(require("dotenv"));
const response_1 = require("@inquitickets/response");
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const Constants_helper_1 = require("../helper/Constants.helper");
dotenv_1.default.config();
const organizationMiddleware = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    let token;
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
        token = req.headers.authorization.split(' ')[1];
    }
    try {
        const ADVISOR_ROLE_ID = Constants_helper_1.Constants.ROLE_ORGANIZATION_ADMIN;
        const decoded = jsonwebtoken_1.default.decode(token);
        if (!decoded || decoded.role !== ADVISOR_ROLE_ID) {
            return response_1.ResponseFormatter.unauthorizedResponse(res, 'Not an organization user');
        }
        next();
    }
    catch (error) {
        return response_1.ResponseFormatter.unauthorizedResponse(res, error.message || "Not authorized, token failed");
    }
});
exports.organizationMiddleware = organizationMiddleware;
