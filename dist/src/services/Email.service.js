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
exports.EmailService = void 0;
const nodemailer_1 = __importDefault(require("nodemailer"));
const routing_controllers_1 = require("routing-controllers");
class EmailService {
    constructor() {
        const transportOptions = {
            host: process.env.MAIL_HOST,
            port: Number(process.env.MAIL_PORT),
            secure: false,
            auth: {
                user: process.env.MAIL_USERNAME,
                pass: process.env.MAIL_PASSWORD,
            }
        };
        this.transporter = nodemailer_1.default.createTransport(transportOptions);
    }
    sendEmail(mailOptions) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const sentEmailInfo = yield this.transporter.sendMail(mailOptions);
                if ((sentEmailInfo === null || sentEmailInfo === void 0 ? void 0 : sentEmailInfo.rejected.length) === 0 && (sentEmailInfo === null || sentEmailInfo === void 0 ? void 0 : sentEmailInfo.accepted.length) > 0) {
                    return true;
                }
                return false;
            }
            catch (error) {
                console.error('Error sending email:', error);
                throw new routing_controllers_1.InternalServerError("Failed to send email!");
            }
        });
    }
}
exports.EmailService = EmailService;
