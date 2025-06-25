import {
    Column,
    CreateDateColumn,
    Entity,
    JoinColumn,
    ManyToOne,
    PrimaryGeneratedColumn,
    UpdateDateColumn
} from "typeorm";
import {ServiceDetails} from "./ServiceDetails.entity";

@Entity()
export class ServiceSetting {
    @PrimaryGeneratedColumn()
    id!: number;

    @Column({ nullable: false})
    available_slots!: number;

    @Column({ type: "simple-array", nullable: true })
    service_manager!: number[];

    @Column({ nullable: false})
    contact_email!: string;

    @Column({ nullable: false})
    contact_phone!: string;

    @ManyToOne(() => ServiceDetails, (services) => services.id)
    @JoinColumn({ name: "service_id" })
    service!: ServiceDetails;

    @CreateDateColumn()
    created_at!: Date;

    @UpdateDateColumn()
    updated_at!: Date;
}
