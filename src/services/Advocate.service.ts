import AppDataSource from "../../ormconfig";
import {Users} from "../entity/Users.entity";
import {Organization} from "../entity/Organization.entity";
import {DeviceToken} from "../entity/DeviceToken.entity";
import {Affiliations} from "../entity/Affiliations.entity";
import {PasswordReset} from "../entity/PasswordReset.entity";
import {ServiceDetails} from "../entity/ServiceDetails.entity";
import {ClientService} from "../entity/ClientService.entity";
import {Constants} from "../helper/Constants.helper";

export class AdvocateService {
    private userRepository = AppDataSource.getRepository(Users);
    private organizationRepository = AppDataSource.getRepository(Organization);
    private deviceTokenRepository = AppDataSource.getRepository(DeviceToken);
    private affiliationRepository = AppDataSource.getRepository(Affiliations);
    private passwordResetRepository = AppDataSource.getRepository(PasswordReset);
    private serviceDetailsRepository = AppDataSource.getRepository(ServiceDetails);
    private clientServiceRepository = AppDataSource.getRepository(ClientService);


    async addClient(user_id: number, organization_id: number, body: any) {
        const addService = await this.clientServiceRepository.create({
            organization: {id: organization_id},
            user: {id: user_id},
            service: body.service,
            client_nick_name: body.client_nick_name,
            zipcode: body.zipcode,
            dob: body.dob,
            english_speaking_ability: body.english_speaking_ability,
            preferred_language: body.preferred_language || "",
            gender: body.gender,
            race: body.race,
            citizenship_status: body.citizenship_status,
            client_experienced: body.client_experienced,
            pregnant: body.pregnant,
            pregnant_months: body.pregnant_months || null,
            birthdate_status: body.birthdate_status || null,
            children_accompany: body.children_accompany || null,
            children_to_accompany: body.children_to_accompany || null,
            criteria: body.criteria,
            criteria_add: body.criteria_add,
            medications: body.medications,
            mental_health_diagnoses: body.mental_health_diagnoses,
            physical_accommodation: body.physical_accommodation,
            specify_physical_accommodation: body.specify_physical_accommodation || "",
            nicotine_products: body.nicotine_products,
        })

        return await this.clientServiceRepository.save(addService);
    }

    async editClient(id: number, user_id: number, organization_id: number, body: any) {
        const getClient = await this.clientServiceRepository.findOne({
            where: {
                id: id,
                user: {id: user_id},
                organization: {id: organization_id},
            }
        })
        if (getClient) {
            getClient.service = body.service
            getClient.client_nick_name = body.client_nick_name
            getClient.zipcode = body.zipcode
            getClient.dob = body.dob
            getClient.english_speaking_ability = body.english_speaking_ability
            getClient.preferred_language = body.preferred_language || ""
            getClient.gender = body.gender
            getClient.race = body.race
            getClient.citizenship_status = body.citizenship_status
            getClient.client_experienced = body.client_experienced
            getClient.pregnant = body.pregnant
            getClient.pregnant_months = body.pregnant_months || null
            getClient.birthdate_status = body.birthdate_status || null
            getClient.children_accompany = body.children_accompany
            getClient.children_to_accompany = body.children_to_accompany
            getClient.criteria = body.criteria
            getClient.criteria_add = body.criteria_add
            getClient.medications = body.medications
            getClient.mental_health_diagnoses = body.mental_health_diagnoses
            getClient.physical_accommodation = body.physical_accommodation
            getClient.specify_physical_accommodation = body.specify_physical_accommodation || ""
            getClient.nicotine_products = body.nicotine_products
            return await this.clientServiceRepository.save(getClient);
        }
        return false
    }

    async checkIfValidClient(id: number, advocate_id: number) {
        return await this.clientServiceRepository.findOne({
            where: {
                id,
                user: {id: advocate_id},
            }
        })
    }

    async checkIfValidOrganization(organization_id: number, advocate_id: number) {
        return await this.userRepository.findOne({
            where: {
                id: advocate_id,
                organization: {id: organization_id},
            }
        })
    }


    async getClients(advocate: number) {
        return await this.clientServiceRepository.find({
            where: {
                user: {id: advocate},
            },
            order: {created_at: "DESC"}
        })
    }

    async getClientsById(id: number) {
        return await this.clientServiceRepository.find({
            where: {
                id
            }
        })
    }

    async checkIfAdvocate(advocate_id: number) {
        return await this.userRepository.findOne({
            where: {
                id: advocate_id,
                role: {id: Constants.ROLE_ADVOCATE},
            }
        })
    }

    async checkIfAdvocateClient(advocate_id: number, id: number) {
        return await this.clientServiceRepository.findOne({
            where: {
                id,
                user: {id: advocate_id},
            }
        })
    }
}
