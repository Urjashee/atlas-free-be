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

export enum ChildrenToAccompany {
    "Yes" = 1,
    "No" = 2,
    "Preferred" = 3,
}

@Entity()
export class ClientService {
    @PrimaryGeneratedColumn()
    id!: number;

    @ManyToOne(() => Organization, { eager: true })
    @JoinColumn({ name: 'organization_id' })
    organization!: Organization;

    @ManyToOne(() => Users, (user) => user.id)
    @JoinColumn({ name: "user_id" })
    user!: Users;

    @ManyToOne(() => Users, (user) => user.id)
    @JoinColumn({ name: "client_id" })
    client!: Users;

    @Column({ type: "simple-array", nullable: true })
    service!: number[];

    @Column({ nullable: true })
    client_nick_name!: string;

    @Column({ nullable: true })
    zipcode!: string;

    @Column({ type: 'timestamp', nullable: true })
    dob!: Date | null

    @Column({ nullable: true })
    english_speaking_ability!: number;

    @Column({ nullable: true })
    preferred_language!: string;

    @Column({ nullable: true, default: 10 })
    gender!: number;

    @Column({ type: "simple-array", nullable: true })
    race!: number[];

    @Column({ nullable: true })
    citizenship_status!: number;

    @Column({ type: "simple-array", nullable: true })
    client_experienced!: number[];

    @Column({ nullable: true })
    pregnant!: boolean;

    @Column({ nullable: true })
    pregnant_months!: number;

    @Column({ nullable: true })
    birthdate_status!: number;

    @Column({ type: "enum", enum: ChildrenToAccompany, nullable: true })
    children_accompany!: number;

    @Column({ nullable: true })
    children_to_accompany!: number;

    @Column({ type: "simple-array", nullable: true })
    criteria!: number[];

    @Column({ type: "simple-array", nullable: true })
    criteria_add!: number[];

    @Column({ type: "simple-array", nullable: true })
    medications!: number[];

    @Column({ nullable: true })
    medications_other!: string;

    @Column({ type: "simple-array", nullable: true })
    mental_health_diagnoses!: number[];

    @Column({ nullable: true })
    mental_health_diagnoses_other!: string;

    @Column({ type: "simple-array", nullable: true })
    physical_accommodation!: number[];

    @Column({ nullable: true })
    specify_physical_accommodation!: string;

    @Column({ type: "simple-array", nullable: true })
    nicotine_products!: number[];

    @CreateDateColumn()
    created_at!: Date;

    @UpdateDateColumn()
    updated_at!: Date;
}
