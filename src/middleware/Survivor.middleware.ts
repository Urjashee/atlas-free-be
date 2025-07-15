import { NextFunction, Request, Response } from 'express';
import dotenv from 'dotenv';
import {ResponseFormatter} from "@inquitickets/response"
import jwt, {JwtPayload} from "jsonwebtoken";
import {Constants} from "../helper/Constants.helper";
dotenv.config();

export const survivorMiddleware = async (req: Request, res: Response, next: NextFunction) => {
    let token;
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
        token = req.headers.authorization.split(' ')[1];
    }
    try {
        const SURVIVOR_ROLE_ID: number = Constants.ROLE_SURVIVOR;
        const decoded = jwt.decode(token) as JwtPayload | null;
        if (!decoded || decoded.role !== SURVIVOR_ROLE_ID) {
            return ResponseFormatter.unauthorizedResponse(res, 'Not an survivor user');
        }
        next()
    } catch (error) {
        return ResponseFormatter.unauthorizedResponse(res, error.message || "Not authorized, token failed");
    }
};
