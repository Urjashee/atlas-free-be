import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    CreateDateColumn,
    UpdateDateColumn,
    ManyToOne,
    JoinColumn, OneToOne, OneToMany
} from "typeorm";
import {UserRole} from "./UserRole.entity";
import {Profiles} from "./Profiles.entity";
import {Affiliations} from "./Affiliations.entity";
import {OrganizationService} from "../services/OrganizationService";
import {OrganizationDetails} from "./OrganizationDetails.entity";

@Entity()
export class Users {
    @PrimaryGeneratedColumn()
    id!: number;

    @Column({ nullable: true })
    user_name!: string;

    @Column({ nullable: true })
    first_name!: string;

    @Column({ nullable: true })
    last_name!: string;

    @Column({ nullable: true })
    title!: string;

    @Column({
        nullable: false,
        unique: false,
        collation: 'utf8mb4_bin'
    })
    email!: string;

    @Column({ nullable: true })
    country_code!: string;

    @Column({ nullable: true })
    mobile!: string;

    @Column({ default: 0 })
    is_active!: boolean;

    @Column({ default: 1 })
    is_status!: boolean;

    @Column({ default: 0 })
    is_profile!: boolean;

    @Column({ nullable: true, type: 'timestamp'})
    emailVerifiedAt!: Date | null;

    @Column({ nullable: true, type: 'timestamp'})
    mobileVerifiedAt!: Date | null;

    @Column({ nullable: true })
    password!: string;

    @ManyToOne(() => UserRole, { eager: true })
    @JoinColumn({ name: 'role_id' })
    role!: UserRole;

    @OneToOne(() => Profiles, profile => profile.user, { cascade: true })
    profile!: Profiles;

    @OneToMany(() => OrganizationDetails, organization_service => organization_service.organization, { cascade: true })
    organizationService!: OrganizationDetails[];

    @OneToMany(() => Affiliations, affiliation => affiliation.user)
    affiliations!: Affiliations[];

    @CreateDateColumn()
    created_at!: Date;

    @UpdateDateColumn()
    updated_at!: Date;
}
