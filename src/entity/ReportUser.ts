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
import {ClientService} from "./ClientService.entity";

export enum UserType {
    Survivor = "survivor",
    Advocate = "advocate"
}

@Entity()
export class ReportUser {
    @PrimaryGeneratedColumn()
    id!: number;

    @Column({ nullable: true })
    reason!: string;

    @Column({ type: "enum", enum: UserType, nullable: true })
    type!: UserType;

    @ManyToOne(() => Organization, { eager: true })
    @JoinColumn({ name: 'organization_id' })
    organization!: Organization;

    @ManyToOne(() => Users, (user) => user.id)
    @JoinColumn({ name: "reported_user_id" })
    reported_user!: Users;

    @ManyToOne(() => ClientService, (client) => client.id)
    @JoinColumn({ name: "reported_client_id" })
    reported_client!: ClientService;

    @ManyToOne(() => Users, (user) => user.id)
    @JoinColumn({ name: "reported_by_id" })
    reported_by!: Users;

    @CreateDateColumn()
    created_at!: Date;

    @UpdateDateColumn()
    updated_at!: Date;
}
