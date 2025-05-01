import jwt from "jsonwebtoken";
import {Users} from "../entity/Users";
import {Constants} from "./Constants";

export class JwtHelper {
    async jwtSign(user: Users): Promise<string> {
        if (user.role.id == Constants.ROLE_ADMIN) {
            return jwt.sign({
                id: user.id,
                email: user.email,
                role: user.role,
                isActive: user.is_active,
                isStatus: user.is_status,
                isProfile: user.is_profile,
            }, process.env.JWT_SECRET as string, {expiresIn: process.env.TOKEN_EXPIRY as any})
        }
    }
}
