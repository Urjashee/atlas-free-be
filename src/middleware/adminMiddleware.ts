import { NextFunction, Request, Response } from 'express';
import dotenv from 'dotenv';
import {ResponseFormatter} from "@inquitickets/response"
import jwt, {JwtPayload} from "jsonwebtoken";
import {Constants} from "../helper/Constants";
dotenv.config();

export const adminMiddleware = async (req: Request, res: Response, next: NextFunction) => {
    let token;
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
        token = req.headers.authorization.split(' ')[1];
    }
    try {
        const ADVISOR_ROLE_ID: number = Constants.ROLE_ADMIN;
        const decoded = jwt.decode(token) as JwtPayload | null;
        if (!decoded || decoded.roleId !== ADVISOR_ROLE_ID) {
            return ResponseFormatter.unauthorizedResponse(res, 'Not an admin');
        }
        next()
    } catch (error) {
        return ResponseFormatter.unauthorizedResponse(res, error.message || "Not authorized, token failed");
    }
};
