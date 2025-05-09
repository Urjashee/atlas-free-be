import AppDataSource from "../../ormconfig";
import {Users} from "../entity/Users.entity";
import {Profiles} from "../entity/Profiles.entity";
import bcrypt from "bcryptjs";
import {DeviceToken} from "../entity/DeviceToken.entity";
import {Constants} from "../helper/Constants";
import {Affiliations} from "../entity/Affiliations.entity";
import s3UploadService from "../helper/S3UploadService";
import {PasswordReset} from "../entity/PasswordReset.entity";
import {IsNull, MoreThan, Not} from "typeorm";

export class UserService {
    private userRepository = AppDataSource.getRepository(Users);
    private profileRepository = AppDataSource.getRepository(Profiles);
    private deviceTokenRepository = AppDataSource.getRepository(DeviceToken);
    private affiliationRepository = AppDataSource.getRepository(Affiliations);
    private passwordResetRepository = AppDataSource.getRepository(PasswordReset);
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
            const uploadedFile = await this.s3UploadService.uploadPdfFile(buffer, "affiliation_file");
            if (uploadedFile) {
                const addAffiliation = await this.affiliationRepository.create({
                    user: {id: savedUser.id},
                    affiliation: {id: affiliation.id},
                    affiliation_file: uploadedFile as string,
                });
                await this.affiliationRepository.save(addAffiliation);
            }
        }
        return savedUser
    }

    async updateUser(user_id: number, body: any){
        const user = await this.userRepository.findOne({
            where: {
                id: user_id,
            }
        })
        if (user) {
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
        const currentAffiliations = await this.affiliationRepository.find({
            where: {
                user: {id: user_id}
            },
        })

        const oldIds = currentAffiliations.map(affiliation => affiliation.affiliation.id)
        const affiliations = JSON.parse(body.affiliations);
        const newIds = affiliations.map(a => a.id);

        console.log("oldIds3: ",oldIds)
        console.log("newIds3: ",newIds)

        const toRemove = currentAffiliations.filter(a => !newIds.includes(a.affiliation.id));

        if (toRemove.length) {
            await this.affiliationRepository.remove(toRemove);
        }
        for (const affiliation of affiliations) {
            console.log("affiliation: ",affiliation.id)
            const affiliationData = await this.affiliationRepository.findOne({
                where: {
                    user: { id: user_id },
                    affiliation: { id: affiliation.id },
                },
            });

            if (affiliationData) {
                const base64Data = affiliation.file.replace(/^data:application\/pdf;base64,/, '');
                const buffer = Buffer.from(base64Data, 'base64');
                const uploadedFile = await this.s3UploadService.uploadPdfFile(buffer, "affiliation_file");
                if (uploadedFile) {
                    affiliationData.affiliation_file = uploadedFile as string
                    await this.affiliationRepository.save(affiliationData)
                }
            } else {
                const base64Data = affiliation.file.replace(/^data:application\/pdf;base64,/, '');
                const buffer = Buffer.from(base64Data, 'base64');
                const uploadedFile = await this.s3UploadService.uploadPdfFile(buffer, "affiliation_file");
                if (uploadedFile) {
                    const addAffiliation = await this.affiliationRepository.create({
                        user: {id: user_id},
                        affiliation: {id: affiliation.id},
                        affiliation_file: uploadedFile as string,
                    });
                    await this.affiliationRepository.save(addAffiliation);
                }
            }
        }
        return true
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

    async checkEmailExpiry(email: string, type: number): Promise<Users | boolean> {
        const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000);
        const verifyUser = await this.passwordResetRepository.findOne({
            where:
                {email, type, active: true, createdAt: MoreThan(fiveMinutesAgo)}
        });
        if (verifyUser) {
            return true
        } else {
            return false
        }
    }
    async sendPasswordResetRequest(email: string, type: number, token: string, user_id?: number) {
        const user = await this.userRepository.findOne({where: {email}});
        if (user) {
            const password_reset_request = this.passwordResetRepository.create({
                email, token, type, user: {id: user_id}
            })
            return await this.passwordResetRepository.save(password_reset_request);
        }
    }

    async findByToken(token: string): Promise<PasswordReset | null> {
        return this.passwordResetRepository.findOne({where: {token, active: true}});
    }

    async checkPasswordExpiry(token: string): Promise<boolean> {
        const getToken = await this.passwordResetRepository.findOne({
            where: {token},
        });

        if (getToken) {
            const expiryTime = new Date(getToken.createdAt);
            expiryTime.setHours(expiryTime.getHours() + 2);

            const currentTime = new Date();

            if (currentTime > expiryTime) {
                return true;
            } else {
                return false;
            }
        }
        return false;
    }

    async updatePassword(email: string, password: string, passwordResetToken) {
        const user = await this.userRepository.findOne({
            where: {
                email,
                emailVerifiedAt: Not(IsNull()),
                mobileVerifiedAt: Not(IsNull())
            }
        });
        if (user) {
            user.password = await bcrypt.hash(password, 10)
            passwordResetToken.active = true
            await this.passwordResetRepository.save(passwordResetToken);
            return await this.userRepository.save(user);
        }
    }

    async createPassword(email: string, password: string, type: number, passwordResetToken: PasswordReset, body: any) {
        const user = await this.userRepository.findOne({
            where: {
                email,
            }
        });
        if (user) {
            user.password = await bcrypt.hash(password, 10)
            user.first_name = body.first_name;
            user.last_name = body.last_name;
            user.title = body.title;
            user.country_code = body.country_code;
            user.mobile = body.phone_no;
            user.is_active = true
            user.emailVerifiedAt = new Date()
            passwordResetToken.active = false
            await this.passwordResetRepository.save(passwordResetToken);
            const resetPasswords = await this.passwordResetRepository.find({
                where: {
                    email,
                    type: Constants.CREATE_PASSWORD
                }
            })
            for (const reset of resetPasswords) {
                reset.active = false
                await this.passwordResetRepository.save(reset);
            }
            return await this.userRepository.save(user);
        }
    }
}
