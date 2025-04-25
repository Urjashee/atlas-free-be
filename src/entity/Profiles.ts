import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    CreateDateColumn,
    UpdateDateColumn,
    ManyToOne,
    JoinColumn, OneToOne
} from "typeorm";
import {Users} from "./Users";

@Entity()
export class Profiles {
    @PrimaryGeneratedColumn()
    id!: number;

    @Column()
    address!: string;

    @Column({default: true})
    disclose_address!: boolean;

    @Column()
    zipcode!: string;

    @Column()
    year!: string;

    @Column()
    website!: string;

    @Column()
    tax_exemption!: boolean;

    @Column()
    ein!: boolean

    @Column({ type: "simple-array", nullable: true })
    primary_purpose!: number

    @Column()
    platform_purpose!: number

    @Column()
    affiliation!: number

    @Column()
    affiliation_file!: string

    @OneToOne(() => Users, user => user.profile, { eager: true })
    @JoinColumn({ name: 'user_id' })
    user!: Users | number;

    @CreateDateColumn()
    created_at!: Date;

    @UpdateDateColumn()
    updated_at!: Date;
}
