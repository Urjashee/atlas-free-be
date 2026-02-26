import jwt from "jsonwebtoken";
import {Users} from "../entity/Users.entity";
import {Constants} from "./Constants.helper";
import {Organization} from "../entity/Organization.entity";

export class JwtHelper {
    async jwtSign(user: Users, organization?: Organization): Promise<string> {
        if (user.role.id == Constants.ROLE_ADMIN) {
            return jwt.sign({
                id: user.id,
                email: user.email,
                role: user.role.id,
                role_name: user.role.name,
                title: user.title,
                first_name: user.first_name,
                last_name: user.last_name,
                isActive: user.is_active,
                isStatus: user.is_status,
                isProfile: user.is_profile,
            }, process.env.JWT_SECRET as string, {expiresIn: process.env.TOKEN_EXPIRY as any})
        }
        if (user.role.id == Constants.ROLE_ORGANIZATION_ADMIN) {
            return jwt.sign({
                id: user.id,
                email: user.email,
                role: user.role.id,
                role_name: user.role.name,
                title: user.title,
                first_name: user.first_name,
                last_name: user.last_name,
                organization_id: organization.id,
                organization_name: organization.name,
                platform_purpose: organization.platform_purpose || "",
                isActive: user.is_active,
                isStatus: user.is_status,
                isProfile: user.is_profile,
            }, process.env.JWT_SECRET as string, {expiresIn: process.env.TOKEN_EXPIRY as any})
        }
        if (user.role.id == Constants.ROLE_SERVICE_MANAGER) {
            return jwt.sign({
                id: user.id,
                email: user.email,
                role: user.role.id,
                role_name: user.role.name,
                title: user.title,
                first_name: user.first_name,
                last_name: user.last_name,
                organization_id: organization.id,
                organization_name: organization.name,
                platform_purpose: organization.platform_purpose || "",
                isActive: user.is_active,
                isStatus: user.is_status,
                isProfile: user.is_profile,
            }, process.env.JWT_SECRET as string, {expiresIn: process.env.TOKEN_EXPIRY as any})
        }
        if (user.role.id == Constants.ROLE_ADVOCATE) {
            return jwt.sign({
                id: user.id,
                email: user.email,
                role: user.role.id,
                role_name: user.role.name,
                title: user.title,
                first_name: user.first_name,
                last_name: user.last_name,
                organization_id: organization.id,
                organization_name: organization.name,
                platform_purpose: organization.platform_purpose || "",
                isActive: user.is_active,
                isStatus: user.is_status,
                isProfile: user.is_profile,
            }, process.env.JWT_SECRET as string, {expiresIn: process.env.TOKEN_EXPIRY as any})
        }
        if (user.role.id == Constants.ROLE_SURVIVOR) {
            return jwt.sign({
                id: user.id,
                email: user.email,
                role: user.role.id,
                role_name: user.role.name,
                isActive: user.is_active,
                isStatus: user.is_status,
                isProfile: user.is_profile,
            }, process.env.JWT_SECRET as string, {expiresIn: process.env.TOKEN_EXPIRY as any})
        }
    }
}
