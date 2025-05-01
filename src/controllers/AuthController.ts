import {Get, HttpCode, JsonController, Param, Post, Req, Res, UseBefore} from "routing-controllers";
import {Request, Response} from "express";
import {ResponseFormatter} from "../helper/ResponseFormatter";
import dotenv from "dotenv";
import Joi from "joi";
import {upload} from "../helper/MulterConfig";
import {UserService} from "../services/UserService";
import {Constants, roleMap} from "../helper/Constants";
import S3UploadService from "../helper/S3UploadService";
import { JwtHelper } from "../helper/JwtHelper";

dotenv.config();
const registrationOrganizationSchema = Joi.object({
    user_name: Joi.string().min(3).max(150).required(),
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
    affiliation_license: Joi.array().items(Joi.number()).required(),
});
const loginSchema = Joi.object({
    email: Joi.string().pattern(/^\S+$/).required(),
    password: Joi.string().required(),
    device_token: Joi.string().allow(null, ""),
    device_type: Joi.string().required(),
});

@JsonController("/api/auth")
export class AuthController {
    private userService = new UserService();
    private s3UploadService = new S3UploadService();
    private jwtHelper = new JwtHelper();

    @Post("/organization/register")
    @UseBefore(upload.array("affiliation_files", 10))
    async registerOrganization(@Req() req: Request, @Res() res: Response) {
        let affiliationFiles = [];
        const files = req.files as Express.Multer.File[];
        console.log("Request headers:", req.headers);
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
            if (files && files.length > 0) {
                console.log("files: ",files[0])
                for (const file of files) {
                    const uploadedFile = await this.s3UploadService.uploadFile(file, "affiliation_file");
                    affiliationFiles.push(uploadedFile);
                }
            }
            const user = await this.userService.createUser(req.body, roleId, affiliationFiles);
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
            const token = await this.jwtHelper.jwtSign(user);
            const updateToken = await this.userService.addToken(user, token, req.body)
            if (!updateToken)
                return ResponseFormatter.errorResponse(res, "Can't login right now");
            return ResponseFormatter.successResponse(res, 'Login success', token);
        } catch (error: any) {
            return ResponseFormatter.errorResponse(res, error.message || 'An error occurred');
        }
    }
}
