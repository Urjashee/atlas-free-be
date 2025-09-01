import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    CreateDateColumn,
    UpdateDateColumn,
    ManyToOne,
    JoinColumn
} from "typeorm";
import {Users} from "./Users.entity";
import {RegistrationOption} from "./RegistrationOption.entity";
import {Organization} from "./Organization.entity";

@Entity()
export class Affiliations {
    @PrimaryGeneratedColumn()
    id!: number;

    @ManyToOne(() => Organization, { eager: true })
    @JoinColumn({ name: 'organization_id' })
    organization!: Organization;

    @ManyToOne(() => RegistrationOption, { eager: true })
    @JoinColumn({ name: 'affiliation_id' })
    affiliation!: RegistrationOption;

    @Column({nullable: true})
    affiliation_file!: string

    @Column({nullable: true, default: "100 KB"})
    file_size!: string

    @Column({ default: 0 })
    is_active!: boolean;

    @CreateDateColumn()
    created_at!: Date;

    @UpdateDateColumn()
    updated_at!: Date;
}
