import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    CreateDateColumn,
    UpdateDateColumn,
    ManyToOne,
    JoinColumn, OneToOne
} from "typeorm";
import {UserRole} from "./UserRole";
import {Profiles} from "./Profiles";

@Entity()
export class Users {
    @PrimaryGeneratedColumn()
    id!: number;

    @Column()
    user_name!: string;

    @Column()
    first_name!: string;

    @Column()
    last_name!: string;

    @Column()
    title!: string;

    @Column({
        nullable: false,
        unique: false,
        collation: 'utf8mb4_bin'
    })
    email!: string;

    @Column({ nullable: false })
    country_code!: string;

    @Column({ nullable: false })
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

    @Column({ nullable: false })
    password!: string;

    @ManyToOne(() => UserRole, { eager: true })
    @JoinColumn({ name: 'role_id' })
    role!: UserRole;

    @OneToOne(() => Profiles, profile => profile.user, { cascade: true }) // Add the one-to-one relationship here
    profile!: Profiles;

    @CreateDateColumn()
    created_at!: Date;

    @UpdateDateColumn()
    updated_at!: Date;
}
