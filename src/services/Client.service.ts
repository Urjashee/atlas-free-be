import AppDataSource from "../../ormconfig";
import {Users} from "../entity/Users.entity";
import {Organization} from "../entity/Organization.entity";
import {PasswordReset} from "../entity/PasswordReset.entity";
import {ServiceDetails} from "../entity/ServiceDetails.entity";
import {AssignedServices} from "../entity/AssignedServices.entity";
import {ReportService} from "../entity/ReportService.entity";

export class ClientService {
    private userRepository = AppDataSource.getRepository(Users);
    private organizationRepository = AppDataSource.getRepository(Organization);
    private passwordResetRepository = AppDataSource.getRepository(PasswordReset);
    private serviceDetailsRepository = AppDataSource.getRepository(ServiceDetails);
    private clientServiceRepository = AppDataSource.getRepository(ClientService);
    private assignedServiceRepository = AppDataSource.getRepository(AssignedServices);
    private reportServiceRepository = AppDataSource.getRepository(ReportService);

    async findExistingServices(organization_id: number,) {
        const services = await this.assignedServiceRepository.find({})
    }

    async addService(body: any) {
        let case_no: string;
        let isUnique = false;

        while (!isUnique) {
            case_no = generateTenDigitNumber().toString();
            const existing = await this.assignedServiceRepository.findOne({
                where: {case_no},
            });
            if (!existing) {
                isUnique = true;
            }
        }
        const addService = await this.assignedServiceRepository.create({
            organization: {id: body.organization_id},
            advocate: {id: body.advocate_id},
            client: {id: body.client_id},
            service: {id: body.service_id},
            case_no
        })

        return await this.assignedServiceRepository.save(addService)
    }

    async getServiceRequests(advocate_id: number) {
        return await this.assignedServiceRepository.find({
            where: {
                advocate: {id: advocate_id},
            },
            relations: ["organization", "service", "client"]
        })
    }

    async getServiceRequestById(id: number) {
        return await this.assignedServiceRepository.findOne({
            where: {
                id
            },
            relations: ["organization", "service", "client", "advocate"]
        });
    }

    async reportService(id: number, reason: string, body: any) {
        const createReport = await this.reportServiceRepository.create({
            reason: reason,
            organization: {id: body.organization.id},
            advocate: {id: body.advocate.id},
            service: {id: body.service.id},
            service_request: {id: body.id}
        })
        return await this.reportServiceRepository.save(createReport);
    }

    async deleteServiceRequest(id: number) {
        const getServiceRequest = await this.assignedServiceRepository.findOne({
            where: {
                id
            }
        })
        if (getServiceRequest) {
            return await this.assignedServiceRepository.delete(getServiceRequest.id);
        } else {
            throw new Error("Service request not found");
        }
    }

}

function generateTenDigitNumber() {
    const min = 100000000000;
    const max = 999999999999;
    return Math.floor(Math.random() * (max - min + 1)) + min;
}
