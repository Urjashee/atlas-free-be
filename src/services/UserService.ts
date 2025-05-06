import AppDataSource from "../../ormconfig";
import {Users} from "../entity/Users";
import {Profiles} from "../entity/Profiles";
import bcrypt from "bcryptjs";
import {DeviceToken} from "../entity/DeviceToken";
import {Constants} from "../helper/Constants";
import {Affiliations} from "../entity/Affiliations";
import s3UploadService from "../helper/S3UploadService";

export class UserService {
    private userRepository = AppDataSource.getRepository(Users);
    private profileRepository = AppDataSource.getRepository(Profiles);
    private deviceTokenRepository = AppDataSource.getRepository(DeviceToken);
    private affiliationRepository = AppDataSource.getRepository(Affiliations);
    private s3UploadService = new s3UploadService

    async findByEmail(email: string): Promise<Users> {
        return await this.userRepository.findOne({
            where: {
                email
            }
        })
    }

    async createUser(body: any, role: number): Promise<Users> {
        const user = await this.userRepository.create({
            email: body.email,
            user_name: body.user_name,
            country_code: body.country_code,
            mobile: body.phone_no,
            is_profile: true,
            is_status: true,
            role: {id: role},
        })
        const savedUser = await this.userRepository.save(user)
        const profile = await Promise.all([this.profileRepository.create({
            user: {id: savedUser.id},
            address: body.address,
            disclose_address: body.disclose_address,
            zipcode: body.zipcode,
            year: body.year,
            website: body.website,
            tax_exemption: body.tax_exemption,
            ein: body.ein,
            primary_purpose: body.primary_purpose,
            platform_purpose: body.platform_purpose,
        })])
        await this.profileRepository.save(profile)
        const affiliations = JSON.parse(body.affiliations);
        for (const affiliation of affiliations) {
            const base64Data = affiliation.file.replace(/^data:application\/pdf;base64,/, '');
            const buffer = Buffer.from(base64Data, 'base64');
            const uploadedFile = await this.s3UploadService.uploadPdfFile(buffer, "affiliation_file")
            if (uploadedFile) {

            }

        }
        return savedUser
    }

    async updateUser(user_id: number, body: any): Promise<Users> {
        const user = await this.userRepository.findOne({
            where: {
                id: user_id,
            }
        })
        if (user) {
            user.email = body.email
            user.user_name = body.user_name
            user.country_code = body.country_code
            user.mobile = body.mobile
            await this.userRepository.save(user)
        }
        const profile = await this.profileRepository.findOne({
            where: {
                user: {id: user_id}
            }
        })
        if (profile) {
            profile.address = body.address
            profile.disclose_address = body.disclose_address
            profile.zipcode = body.zipcode
            profile.year = body.year
            profile.website = body.website
            profile.tax_exemption = body.tax_exemption
            profile.primary_purpose = body.primary_purpose
            await this.profileRepository.save(profile)
        }
        return user
    }

    async updateAffiliations(user_id: number, body: any) {

    }

    async checkIfEmail(email: string) {
        return await this.userRepository.findOne({
            where: {
                email
            }
        });
    }

    async checkIfVerified(email: string) {
        const user = await this.userRepository.findOneBy({email});
        if (user.emailVerifiedAt == null) {
            return false
        } else {
            return true
        }
    }

    async checkIfActive(email: string) {
        const user = await this.userRepository.findOneBy({email});
        if (user.is_active != true) {
            return false
        } else {
            return true
        }
    }

    async findUserByCredentials(email: string, password: string) {
        const user = await this.userRepository.findOneBy({email});
        if (user && await bcrypt.compare(password, user.password)) {
            return user;
        }
        return null;
    }

    async addToken(user: Users, token: string, body: any) {
        const userToken = this.deviceTokenRepository.create({
            device_token: body.device_token,
            device_type: body.device_type,
            token: token,
            user: user.id,
        });
        return await this.deviceTokenRepository.save(userToken);
    }

    async checkIfValidRole(email: string, role: number) {
        return await this.userRepository.findOne({
            where: {
                email: email,
                role: {id: role},
            }
        })
    }
}
