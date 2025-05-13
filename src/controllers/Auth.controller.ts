import {Body, Get, HttpCode, JsonController, Param, Post, Req, Res, UseBefore} from "routing-controllers";
import {Request, Response} from "express";
import {ResponseFormatter} from "../helper/ResponseFormatter.helper";
import dotenv from "dotenv";
import Joi from "joi";
import {upload} from "../helper/MulterConfig.helper";
import {UserService} from "../services/User.service";
import {Constants, roleMap} from "../helper/Constants.helper";
import S3UploadService from "../helper/S3UploadService.helper";
import { JwtHelper } from "../helper/Jwt.helper";
import {randomBytes} from "crypto";
import {EmailService} from "../services/Email.service";
import {PasswordResetEmail} from "../helper/Emails.helper";

dotenv.config();
const registrationOrganizationSchema = Joi.object({
    name: Joi.string().min(3).max(150).required(),
    email: Joi.string().email().pattern(/^\S+$/).required(),
    country_code: Joi.string().min(2).max(5).required(),
    phone_no: Joi.string().pattern(/^\d+$/).min(6).max(16).required(),
    address: Joi.string().min(3).max(1600).required(),
    disclose_address: Joi.boolean().required(),
    zipcode: Joi.string().min(4).max(10).required(),
    year: Joi.string().min(4).max(5).required(),
    website: Joi.string().min(4).max(100).required(),
    tax_exemption: Joi.number().min(0).max(1).required(),
    ein: Joi.string().min(5).max(30).required(),
    primary_purpose: Joi.array().items(Joi.number()).required(),
    platform_purpose: Joi.number().required(),
    // affiliation_license: Joi.array().items(Joi.number()).required(),
    affiliations: Joi.string().required(),
});
const loginSchema = Joi.object({
    email: Joi.string().pattern(/^\S+$/).required(),
    password: Joi.string().required(),
    device_token: Joi.string().allow(null, ""),
    device_type: Joi.string().required(),
});

const forgotPasswordSchema = Joi.object({
    email: Joi.string().email().pattern(/^\S+$/).required(),
});
const logoutSchema = Joi.object({
    device_token: Joi.string(),
});
const updatePasswordSchema = Joi.object({
    token: Joi.string().required(),
    type: Joi.number().required(),
    password: Joi.string()
        .min(8) // At least 8 characters
        .pattern(new RegExp('^(?=.*[a-z])(?=.*[A-Z])(?=.*\\d)[A-Za-z\\d]{8,}$')) // At least one uppercase, one lowercase, one number
        .required()
        .messages({
            'string.min': 'Password must be at least 8 characters long.',
            'string.pattern.base': 'Password must contain at least one uppercase letter, one lowercase letter, and one number.',
            'any.required': 'Password is required.',
        }),
});
const createPasswordSchema = Joi.object({
    token: Joi.string().required(),
    first_name: Joi.string().required(),
    last_name: Joi.string().required(),
    title: Joi.string().required(),
    type: Joi.number().required(),
    country_code: Joi.string().min(2).max(5).required(),
    phone_no: Joi.string().pattern(/^\d+$/).min(6).max(16).required(),
    password: Joi.string()
        .min(8) // At least 8 characters
        .pattern(new RegExp('^(?=.*[a-z])(?=.*[A-Z])(?=.*\\d)[A-Za-z\\d]{8,}$')) // At least one uppercase, one lowercase, one number
        .required()
        .messages({
            'string.min': 'Password must be at least 8 characters long.',
            'string.pattern.base': 'Password must contain at least one uppercase letter, one lowercase letter, and one number.',
            'any.required': 'Password is required.',
        }),
});

@JsonController("/api/auth")
export class AuthController {
    private userService = new UserService();
    private s3UploadService = new S3UploadService();
    private jwtHelper = new JwtHelper();
    private mailerService = new EmailService();

    @Post("/organization/register")
    @UseBefore(upload.array("affiliation_files", 10))
    async registerOrganization(@Req() req: Request, @Res() res: Response) {
        try {
            if (!req.body) {
                return ResponseFormatter.errorResponse(res, 'Request body is undefined.');
            }
            const {error} = registrationOrganizationSchema.validate(req.body);
            if (error) {
                return ResponseFormatter.errorResponse(res, error.details[0].message);
            }
            const existingUser = await this.userService.findByEmail(req.body.email);
            if (existingUser) {
                return ResponseFormatter.errorResponse(res, 'Email already in use');
            }
            const roleId = Constants.ROLE_ORGANIZATION
            const user = await this.userService.createUser(req.body, roleId,);
            if (user)
                return ResponseFormatter.successResponse(res, 'User created')
            return ResponseFormatter.successResponse(res, 'User created')

        } catch (error: any) {
            return ResponseFormatter.errorResponse(res, error.message || 'An error occurred');
        }
    }

    @HttpCode(200)
    @Post("/:user_type/login")
    async login(@Req() req: Request, @Res() res: Response, @Param("user_type") user_type: string ) {
        const {error} = loginSchema.validate(req.body);
        if (error) {
            return ResponseFormatter.errorResponse(res, error.details[0].message);
        }
        const roleId = roleMap[user_type]
        console.log("user_type: ", user_type)
        console.log("roleId: ", roleId)
        const checkIfAdmin = await this.userService.checkIfValidRole(req.body.email, roleId);
        if (!checkIfAdmin)
            return ResponseFormatter.errorResponse(res, `Not an ${user_type} user`);
        try {
            const checkIsEmail = await this.userService.checkIfEmail(req.body.email)
            if (!checkIsEmail)
                return ResponseFormatter.errorResponse(res, 'Not a valid email!');
            const checkIsEmailVerified = await this.userService.checkIfVerified(req.body.email)
            if (!checkIsEmailVerified)
                return ResponseFormatter.errorResponse(res, 'User email is not verified');
            const checkIsActive = await this.userService.checkIfActive(req.body.email)
            if (!checkIsActive)
                return ResponseFormatter.errorResponse(res, 'User is not active');
            const user = await this.userService.findUserByCredentials(req.body.email, req.body.password);
            if (!user)
                return ResponseFormatter.errorResponse(res, 'Your credentials are wrong', user);

            const token = await this.jwtHelper.jwtSign(user, user.organization);
            const updateToken = await this.userService.addToken(user, token, req.body)
            if (!updateToken)
                return ResponseFormatter.errorResponse(res, "Can't login right now");
            return ResponseFormatter.successResponse(res, 'Login success', token);
        } catch (error: any) {
            return ResponseFormatter.errorResponse(res, error.message || 'An error occurred');
        }
    }
    @Post("/forgot-password")
    async forgotPassword(@Req() req: Request, @Res() res: Response, @Body() body: { email: string }) {
        try {
            const {error} = forgotPasswordSchema.validate(body);
            if (error) {
                return ResponseFormatter.errorResponse(res, error.details[0].message);
            }
            const {email} = body;
            const existingUser = await this.userService.findByEmail(email);
            if (!existingUser)
                return ResponseFormatter.errorResponse(res, 'Email address is unverified or does not exist');
            if (existingUser) {
                const type = Constants.FORGOT_PASSWORD
                const checkEmailExpiry = await this.userService.checkEmailExpiry(email, type)
                if (checkEmailExpiry) {
                    return ResponseFormatter.errorResponse(res, 'Password reset link already sent. You can send a new reset password link only after 5 minutes');
                }
                const token = randomBytes(32).toString('hex');
                const sendRequest = await this.userService.sendPasswordResetRequest(email, type, token)
                if (sendRequest) {
                    const emailContent = PasswordResetEmail(email, token, type, existingUser.role.id);
                    const mailOptions = {
                        from: `"${process.env.MAIL_FROM_NAME}" <${process.env.MAIL_FROM_ADDRESS}>`,
                        to: email,
                        subject: "Email from Atlas free!",
                        html: emailContent
                    };
                    await this.mailerService.sendEmail(mailOptions);
                    return ResponseFormatter.successResponse(res, "Reset request sent successfully")
                }
            } else {
                return ResponseFormatter.errorResponse(res, 'Email address is unverified or does not exist');
            }
        } catch (error: any) {
            return ResponseFormatter.errorResponse(res, error.message || 'An error occurred');
        }
    }

    @Post("/create-password")
    async createPassword(@Req() req: Request, @Res() res: Response) {
        try {
            const {error} = createPasswordSchema.validate(req.body);
            if (error) {
                return ResponseFormatter.errorResponse(res, error.details[0].message);
            }
            const {token, password, type} = req.body;
            const passwordResetToken = await this.userService.findByToken(token);
            if (!passwordResetToken)
                return ResponseFormatter.errorResponse(res, 'Token not found');

            const createPassword = await this.userService.createPassword(passwordResetToken.email, password, type, passwordResetToken, req.body)
            if (!createPassword)
                return ResponseFormatter.errorResponse(res, "Password couldn't be created. Try again later");
            return ResponseFormatter.successResponse(res, "Password created successfully!")
        } catch (error: any) {
            return ResponseFormatter.errorResponse(res, error.message || 'An error occurred');
        }
    }
}
