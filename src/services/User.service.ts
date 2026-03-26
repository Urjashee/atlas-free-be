import AppDataSource from "../../ormconfig";
import {Users} from "../entity/Users.entity";
import bcrypt from "bcryptjs";
import {DeviceToken} from "../entity/DeviceToken.entity";
import {Constants} from "../helper/Constants.helper";
import {Affiliations} from "../entity/Affiliations.entity";
import s3UploadService from "../helper/S3UploadService.helper";
import {PasswordReset} from "../entity/PasswordReset.entity";
import {In, IsNull, MoreThan, Not} from "typeorm";
import {Organization} from "../entity/Organization.entity";
import {randomBytes} from "crypto";
import {VerifyEmail} from "../helper/Emails.helper";
import {EmailService} from "./Email.service";
import {DataSource} from "typeorm";
import {ClientService} from "../entity/ClientService.entity";

export class UserService {
    private userRepository = AppDataSource.getRepository(Users);
    private organizationRepository = AppDataSource.getRepository(Organization);
    private clientServiceRepository = AppDataSource.getRepository(ClientService);
    private deviceTokenRepository = AppDataSource.getRepository(DeviceToken);
    private affiliationRepository = AppDataSource.getRepository(Affiliations);
    private passwordResetRepository = AppDataSource.getRepository(PasswordReset);
    private s3UploadService = new s3UploadService
    private mailerService = new EmailService();

    async findByEmail(email: string): Promise<Users> {
        return await this.userRepository.findOne({
            where: {
                email,
            }
        })
    }

    async findByEin(ein: string): Promise<Organization> {
        return await this.organizationRepository.findOne({
            where: {
                ein
            }
        })
    }

    async findByEinExceptOwn(ein: string, organization_id: number): Promise<Organization> {
        return await this.organizationRepository.findOne({
            where: {
                ein,
                id: Not(organization_id)
            }
        });
    }

    async findByEmailVerified(email: string): Promise<Users> {
        return await this.userRepository.findOne({
            where: {
                email,
                emailVerifiedAt: Not(null)
            }
        })
    }

    async findById(id: number): Promise<Users> {
        return await this.userRepository.findOne({
            where: {
                id
            }
        })
    }

    // async createUser(body: any, role: number): Promise<Users> {
    //     const queryRunner = AppDataSource.createQueryRunner();
    //
    //     await queryRunner.connect();
    //     await queryRunner.startTransaction();
    //
    //     const profile = await this.organizationRepository.create({
    //         street: body.street,
    //         address: body.address,
    //         state: body.state,
    //         city: body.city,
    //         name: body.name,
    //         disclose_address: body.disclose_address,
    //         zipcode: body.zipcode,
    //         year: body.year,
    //         website: body.website,
    //         tax_exemption: body.tax_exemption,
    //         ein: body.ein || null,
    //         primary_purpose: body.primary_purpose,
    //         platform_purpose: body.platform_purpose,
    //         under_review: true,
    //         is_active: true,
    //     })
    //     const org = await this.organizationRepository.save(profile)
    //     const user = await this.userRepository.create({
    //         email: body.email,
    //         country_code: body.country_code,
    //         mobile: body.phone_no,
    //         is_profile: true,
    //         is_status: true,
    //         role: {id: role},
    //         organization: {id: org.id},
    //     })
    //     const savedUser = await this.userRepository.save(user)
    //
    //     if (body.affiliations && body.affiliations !== "") {
    //         const affiliations = JSON.parse(body.affiliations);
    //         for (const affiliation of affiliations) {
    //             if (!affiliation.file.startsWith("data:application/pdf;base64,")) {
    //                 throw new Error("Only PDF files are allowed");
    //             }
    //             const base64Data = affiliation.file.replace(/^data:application\/pdf;base64,/, '');
    //             const buffer = Buffer.from(base64Data, 'base64');
    //             if (buffer.length > Constants.MAX_FILE_SIZE_BYTES) {
    //                 throw new Error("PDF file size must be less than or equal to 4 MB");
    //             }
    //             const fileSizeBytes = buffer.length;
    //             const fileSizeKB = (fileSizeBytes / 1024).toFixed(2);
    //             const fileSizeMB = (fileSizeBytes / (1024 * 1024)).toFixed(2);
    //             const uploadedFile = await this.s3UploadService.uploadPdfFile(buffer, "affiliation_file");
    //             if (uploadedFile) {
    //                 const addAffiliation = await this.affiliationRepository.create({
    //                     organization: {id: org.id},
    //                     affiliation: {id: affiliation.id},
    //                     affiliation_file: uploadedFile as string,
    //                     file_size: fileSizeKB + " KB",
    //                 });
    //                 await this.affiliationRepository.save(addAffiliation);
    //             }
    //         }
    //     }
    //     return savedUser
    // }

    async createUser(body: any, role: number): Promise<Users> {
        const queryRunner = AppDataSource.createQueryRunner();

        await queryRunner.connect();
        await queryRunner.startTransaction();

        try {
            const profile = queryRunner.manager.create(Organization, {
                street: body.street,
                address: body.address,
                state: body.state,
                city: body.city,
                name: body.name,
                disclose_address: body.disclose_address,
                zipcode: body.zipcode,
                year: body.year,
                website: body.website,
                tax_exemption: body.tax_exemption === "1",
                ein: body.ein || null,
                primary_purpose: body.primary_purpose,
                platform_purpose: body.platform_purpose,
                under_review: true,
                is_active: true,
            });

            const org = await queryRunner.manager.save(profile);

            const user = queryRunner.manager.create(Users, {
                email: body.email,
                country_code: body.country_code,
                mobile: body.phone_no,
                is_profile: true,
                is_status: true,
                role: {id: role},
                organization: {id: org.id},
            });

            const savedUser = await queryRunner.manager.save(user);

            if (body.affiliations && body.affiliations !== "") {
                const affiliations = JSON.parse(body.affiliations);

                for (const affiliation of affiliations) {
                    if (!affiliation.file.startsWith("data:application/pdf;base64,")) {
                        throw new Error("Only PDF files are allowed");
                    }
                    const base64Data = affiliation.file.replace(
                        /^data:application\/pdf;base64,/,
                        ""
                    );
                    const buffer = Buffer.from(base64Data, "base64");
                    if (buffer.length > Constants.MAX_FILE_SIZE_BYTES) {
                        throw new Error("PDF file size must be less than or equal to 4 MB");
                    }
                    const fileSizeBytes = buffer.length;
                    const fileSizeKB = (fileSizeBytes / 1024).toFixed(2);

                    const uploadedFile =
                        await this.s3UploadService.uploadPdfFile(
                            buffer,
                            "affiliation_file"
                        );

                    if (uploadedFile) {
                        const addAffiliation =
                            queryRunner.manager.create(Affiliations, {
                                organization: {id: org.id},
                                affiliation: {id: affiliation.id},
                                affiliation_file: uploadedFile as string,
                                file_size: fileSizeKB + " KB",
                            });

                        await queryRunner.manager.save(addAffiliation);
                    }
                }
            }

            await queryRunner.commitTransaction();

            return savedUser;

        } catch (error) {
            await queryRunner.rollbackTransaction();
            throw error;

        } finally {
            await queryRunner.release();
        }
    }

    async createSurvivor(body: any, role: number): Promise<Users> {
        const user = await this.userRepository.create({
            email: body.email,
            user_name: body.username,
            password: await bcrypt.hash(body.password, 10),
            is_profile: true,
            is_status: true,
            role: {id: role},
        })
        const saved_user = await this.userRepository.save(user);

        const token = randomBytes(32).toString('hex');
        const password_reset_request = this.passwordResetRepository.create({
            email: body.email,
            token,
            type: Constants.VERIFY_EMAIL,
            user: {id: saved_user.id}
        })
        await this.passwordResetRepository.save(password_reset_request);
        const emailContent = VerifyEmail(body.username, saved_user.id, token, Constants.VERIFY_EMAIL, Constants.ROLE_SURVIVOR);
        const mailOptions = {
            from: `"${process.env.MAIL_FROM_NAME}" <${process.env.MAIL_FROM_ADDRESS}>`,
            to: body.email,
            subject: "Email from Atlas free!",
            html: emailContent
        };
        await this.mailerService.sendEmail(mailOptions);
        return saved_user
    }

    async sendEmail(email: string, username: string, user_id: number) {
        const token = randomBytes(32).toString('hex');
        const password_reset_request = this.passwordResetRepository.create({
            email: email,
            token,
            type: Constants.VERIFY_EMAIL,
            user: {id: user_id}
        })
        await this.passwordResetRepository.save(password_reset_request);
        const emailContent = VerifyEmail(username, user_id, token, Constants.VERIFY_EMAIL, Constants.ROLE_SURVIVOR);
        const mailOptions = {
            from: `"${process.env.MAIL_FROM_NAME}" <${process.env.MAIL_FROM_ADDRESS}>`,
            to: email,
            subject: "Email from Atlas free!",
            html: emailContent
        };
        return await this.mailerService.sendEmail(mailOptions);
    }

    async updateUser(organization_id: number, body: any, role?: number) {
        console.log("Body: ", body);

        const user = await this.userRepository.findOne({
            where: {organization: {id: organization_id}}
        });

        if (user) {
            user.country_code = body.country_code;
            user.mobile = body.mobile;
            await this.userRepository.save(user);
        }

        const organization = await this.organizationRepository.findOne({
            where: {id: organization_id}
        });

        if (!organization) return false;

        organization.street = body.street;
        organization.address = body.address;
        organization.state = body.state;
        organization.city = body.city;
        organization.disclose_address = body.disclose_address === "true";
        organization.zipcode = body.zipcode;
        organization.year = body.year;
        organization.website = body.website;
        organization.ein = body.ein || null;
        organization.tax_exemption = body.tax_exemption === "1";
        organization.primary_purpose = body.primary_purpose;

        /* ================= AFFILIATIONS ================= */

        if (body.affiliations) {
            const affiliations = JSON.parse(body.affiliations);

            const currentAffiliations = await this.affiliationRepository.find({
                where: {organization: {id: organization_id}},
            });

            /* 🔒 NORMALIZE IDS (CRITICAL FIX) */
            const oldIds = currentAffiliations
                .map(a => Number(a.affiliation.id))
                .sort();

            const newIds = affiliations
                .map(a => Number(a.id))
                .sort();

            /* ✅ STRICT EQUALITY CHECK */
            const sameIds =
                oldIds.length === newIds.length &&
                oldIds.every((id, index) => id === newIds[index]);

            /* ✅ FILE EDIT CHECK */
            const hasFileEdit = affiliations.some(
                a => typeof a.file === "string" && a.file.trim() !== ""
            );

            /* ✅ SET UNDER REVIEW ONLY WHEN REAL CHANGE */
            if (!sameIds || hasFileEdit) {
                organization.under_review = true;
            }

            /* ================= DELETE REMOVED ================= */
            const toRemove = currentAffiliations.filter(
                a => !newIds.includes(Number(a.affiliation.id))
            );

            if (toRemove.length) {
                await this.affiliationRepository.remove(toRemove);
            }

            /* ================= ADD / UPDATE ================= */
            for (const affiliation of affiliations) {
                if (!affiliation.file || affiliation.file.trim() === "") continue;
                if (!affiliation.file.startsWith("data:application/pdf;base64,")) {
                    throw new Error("Only PDF files are allowed");
                }
                const base64Data = affiliation.file.replace(
                    /^data:application\/pdf;base64,/,
                    ""
                );
                const buffer = Buffer.from(base64Data, "base64");
                if (buffer.length > Constants.MAX_FILE_SIZE_BYTES) {
                    throw new Error("PDF file size must be less than or equal to 4 MB");
                }
                const fileSizeKB = (buffer.length / 1024).toFixed(2);

                const uploadedFile = await this.s3UploadService.uploadPdfFile(
                    buffer,
                    "affiliation_file"
                );

                if (!uploadedFile) continue;

                if (uploadedFile) {
                    const addAffiliation = this.affiliationRepository.create({
                        organization: {id: organization_id},
                        affiliation: {id: Number(affiliation.id)},
                        affiliation_file: uploadedFile as string,
                        file_size: `${fileSizeKB} KB`,
                    });
                    await this.affiliationRepository.save(addAffiliation);
                }

            }

            if (role === Constants.ROLE_ORGANIZATION_ADMIN) {
                organization.is_active = true;
            }
        }

        await this.organizationRepository.save(organization);
        return true;
    }


    async checkIfEmail(email: string) {
        return await this.userRepository.findOne({
            where: {
                email
            },
            relations: ["organization"]
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
        const user = await this.userRepository.findOne({
            where: {
                email,
            }, relations: ["organization"]
        });
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
        if (user.role.id == Constants.ROLE_SURVIVOR) {
            if (user.is_first_login === true) {
                user.is_first_login = false;
                await this.userRepository.save(user);
            }
        }
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

    async checkPreviousPassword(email: string, password: string) {
        const user = await this.userRepository.findOne({where: {email}});
        const isMatch = await bcrypt.compare(password, user.password);
        if (isMatch) {
            return false
        }
        return true
    }

    async checkIfSetup(email: string) {
        const user = await this.userRepository.findOne({where: {email}});
        if (user.password == null) return false;
        return true
    }

    async updatePassword(email: string, password: string, passwordResetToken) {
        const user = await this.userRepository.findOne({
            where: {
                email,
                emailVerifiedAt: Not(IsNull()),
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

    async checkIfTokenVerified(user_id: number, token: string) {
        const verifyUser = await this.passwordResetRepository.findOne({
            where:
                {
                    token,
                    user: {id: user_id},
                    active: false,
                }
        });
        if (verifyUser) {
            return true
        }
        return false
    }

    async findByCode(user_id: number, token: string): Promise<Users> {
        const verifyUser = await this.passwordResetRepository.findOne({where: {token, user: {id: user_id}}});
        if (verifyUser) {
            const user = await this.userRepository.findOne({where: {email: verifyUser.email}});
            if (user) {
                const id = user.id
                user.emailVerifiedAt = new Date()
                user.is_active = true
                verifyUser.active = false
                await this.passwordResetRepository.save(verifyUser);
                return await this.userRepository.save(user);
            }
        }
    }

    async checkIfSurvivor(user_id: number) {
        return await this.userRepository.findOne({
            where: {
                id: user_id,
                role: {id: Constants.ROLE_SURVIVOR},
            }
        });
    }

    async checkIfClientService(user_id: number) {
        return await this.clientServiceRepository.findOne({
            where: {
                id: user_id,
            },
            relations: ["client"]
        });
    }

    async checkIfAdvocateForReport(user_id: number) {
        return await this.userRepository.findOne({
            where: {
                id: user_id,
                role: {
                    id: In([
                        Constants.ROLE_ADVOCATE,
                        Constants.ROLE_ORGANIZATION_ADMIN,
                    ]),
                },
            }
        });
    }

    async checkIfAdvocate(user_id: number) {
        return await this.userRepository.findOne({
            where: {
                id: user_id,
                role: {id: Constants.ROLE_ADVOCATE},
            }
        });
    }

    async checkIfServiceManager(user_id: number) {
        return await this.userRepository.findOne({
            where: {
                id: user_id,
                role: {id: Constants.ROLE_SERVICE_MANAGER},
            }
        });
    }

    async updateUserProfile(user_id: number, username: string, email: string, safe_exit: string) {
        const user = await this.userRepository.findOne({
            where: {
                id: user_id
            }
        });
        if (user) {
            user.user_name = username;
            user.safe_exit = safe_exit;
            return await this.userRepository.save(user);
        }
        return null;
    }

    async passwordResetDelete(user_id: number) {
        const password_resets = await this.passwordResetRepository.find({
            where: {
                user: {id: user_id}
            }
        })
        if (password_resets) {
            for (const password_reset of password_resets) {
                await this.passwordResetRepository.delete(password_reset.id)
            }
        }
    }

    async deleteDeviceTokenForAllUser(user_id: number) {
        const device_tokens = await this.deviceTokenRepository.find({
            where: {
                user: {id: user_id}
            }
        })
        if (device_tokens) {
            for (const device of device_tokens) {
                await this.deviceTokenRepository.delete(device.id)
            }
        }
    }

    async deleteUser(user_id: number, role: number) {
        const users = await this.userRepository.find({
            where: {
                id: user_id,
                role: {id: role}
            }
        })
        if (users) {
            for (const user of users) {
                await this.userRepository.remove(user)
            }
            return true
        }
        return false
    }
}
