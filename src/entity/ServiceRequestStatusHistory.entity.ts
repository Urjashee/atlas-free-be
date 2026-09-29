import {
    Column,
    CreateDateColumn,
    Entity,
    JoinColumn,
    ManyToOne,
    PrimaryGeneratedColumn
} from "typeorm";
import {AssignedServices} from "./AssignedServices.entity";

@Entity()
export class ServiceRequestStatusHistory {
    @PrimaryGeneratedColumn()
    id!: number;

    @ManyToOne(() => AssignedServices, { nullable: false, onDelete: "CASCADE", onUpdate: "CASCADE" })
    @JoinColumn({ name: "assigned_service_id" })
    assigned_service!: AssignedServices;

    @Column({ type: "int" })
    status!: number;

    @CreateDateColumn()
    created_at!: Date;
}
