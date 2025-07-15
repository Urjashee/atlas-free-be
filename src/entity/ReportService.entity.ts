import {
    Column,
    CreateDateColumn,
    Entity,
    JoinColumn,
    ManyToOne,
    PrimaryGeneratedColumn,
    UpdateDateColumn
} from "typeorm";
import {Users} from "./Users.entity";
import {Organization} from "./Organization.entity";
import {ServiceDetails} from "./ServiceDetails.entity";
import {ClientService} from "./ClientService.entity";
import {AssignedServices} from "./AssignedServices.entity";

export enum ChildrenToAccompany {
    "Yes" = 1,
    "No" = 2,
    "Preferred" = 3,
}
export enum ClientStatus {
    "Placed" = 0,
    "Pending" = 1,
    "Unable to serve" = 2,
    "Waitlisted" = 3,
}

@Entity()
export class ReportService {
    @PrimaryGeneratedColumn()
    id!: number;

    @Column({ nullable: true })
    reason!: string;

    @ManyToOne(() => Organization, { eager: true })
    @JoinColumn({ name: 'organization_id' })
    organization!: Organization;

    @ManyToOne(() => Users, (user) => user.id)
    @JoinColumn({ name: "user_id" })
    user!: Users;

    @ManyToOne(() => ServiceDetails, (services) => services.id)
    @JoinColumn({ name: "service_id" })
    service!: ServiceDetails;

    @CreateDateColumn()
    created_at!: Date;

    @UpdateDateColumn()
    updated_at!: Date;
}
