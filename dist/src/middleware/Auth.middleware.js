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
exports.authMiddleware = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const dotenv_1 = __importDefault(require("dotenv"));
const response_1 = require("@inquitickets/response");
const ormconfig_1 = __importDefault(require("../../ormconfig"));
const DeviceToken_entity_1 = require("../entity/DeviceToken.entity");
dotenv_1.default.config();
const authMiddleware = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    let token;
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
        token = req.headers.authorization.split(' ')[1];
    }
    if (!token) {
        return response_1.ResponseFormatter.unauthorizedResponse(res, "Not authorized, no token");
    }
    const tokenRepository = ormconfig_1.default.getRepository(DeviceToken_entity_1.DeviceToken);
    const jwtToken = yield tokenRepository.findOne({
        where: { token: token },
    });
    if (!jwtToken)
        return response_1.ResponseFormatter.unauthorizedResponse(res, "Not authorized");
    try {
        jsonwebtoken_1.default.verify(token, process.env.JWT_SECRET, (err, decodedUser) => {
            if (err) {
                return response_1.ResponseFormatter.forbiddenResponse(res, "Invalid token");
            }
            req.user = decodedUser;
            next();
        });
    }
    catch (error) {
        return response_1.ResponseFormatter.unauthorizedResponse(res, "Not authorized, token failed");
    }
});
exports.authMiddleware = authMiddleware;
