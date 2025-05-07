import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    CreateDateColumn,
    UpdateDateColumn,
    ManyToOne,
    JoinColumn
} from "typeorm";
import {Users} from "./Users";
import {RegistrationOption} from "./RegistrationOption";

@Entity()
export class Affiliations {
    @PrimaryGeneratedColumn()
    id!: number;

    @ManyToOne(() => Users, { eager: true })
    @JoinColumn({ name: 'user_id' })
    user!: Users;

    @ManyToOne(() => RegistrationOption, { eager: true })
    @JoinColumn({ name: 'affiliation_id' })
    affiliation!: RegistrationOption;

    @Column({nullable: true})
    affiliation_file!: string

    @Column({ default: 0 })
    is_active!: boolean;

    @CreateDateColumn()
    created_at!: Date;

    @UpdateDateColumn()
    updated_at!: Date;
}
