import { NextFunction, Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';
import {ResponseFormatter} from "@inquitickets/response"
import AppDataSource from "../../ormconfig";
import {DeviceToken} from "../entity/DeviceToken.entity";
import {Users} from "../entity/Users.entity";
import {Constants} from "../helper/Constants.helper";
dotenv.config();

export const authMiddleware = async (req: Request, res: Response, next: NextFunction) => {
    let token;
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
        token = req.headers.authorization.split(' ')[1];
    }

    if (!token) {
        return ResponseFormatter.unauthorizedResponse(res, "Not authorized, no token");
    }

    const tokenRepository = AppDataSource.getRepository(DeviceToken);
    const jwtToken = await tokenRepository.findOne({
        where: { token: token },
    });
    if (!jwtToken)
        return ResponseFormatter.unauthorizedResponse(res, "Not authorized");

    try {
        jwt.verify(token, process.env.JWT_SECRET! as string, async (err: any, decodedUser: any) => {
            if (err) {
                return ResponseFormatter.forbiddenResponse(res, "Invalid token");
            }

            if (decodedUser.role !== Constants.ROLE_ADMIN) {
                const userRepo = AppDataSource.getRepository(Users);
                const user = await userRepo.findOne({
                    where: { id: decodedUser.id },
                    relations: ["organization"],
                });

                if (!user || !user.is_active) {
                    return ResponseFormatter.unauthorizedResponse(res, "User account is inactive");
                }
                if (user.organization && !user.organization.is_active) {
                    return ResponseFormatter.unauthorizedResponse(res, "Organization is inactive");
                }
            }

            req.user = decodedUser as any;
            next();
        });
    } catch (error) {
        return ResponseFormatter.unauthorizedResponse(res, "Not authorized, token failed");
    }
};
