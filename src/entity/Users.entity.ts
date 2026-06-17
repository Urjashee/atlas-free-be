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
import {Organization} from "./Organization.entity";

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

    @Column({ nullable: true, default: 'https://google.com' })
    safe_exit!: string;

    @Column({ nullable: false, default: true })
    is_first_login!: boolean; //check if the user has done a first login

    @Column({ nullable: false, default: true })
    receive_service_status_emails!: boolean;

    @ManyToOne(() => UserRole, { eager: true })
    @JoinColumn({ name: 'role_id' })
    role!: UserRole;

    @ManyToOne(() => Organization, organization => organization.users)
    @JoinColumn({ name: 'organization_id' })
    organization!: Organization;

    @CreateDateColumn()
    created_at!: Date;

    @UpdateDateColumn()
    updated_at!: Date;
}
