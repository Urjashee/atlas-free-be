import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    CreateDateColumn,
    UpdateDateColumn, ManyToOne, JoinColumn
} from "typeorm";
import {Users} from "./Users";


@Entity()
export class PasswordReset {
    @PrimaryGeneratedColumn()
    id!: number;

    @Column({ nullable: false })
    email!: string;

    @Column({ type: "longtext", nullable: false })
    token!: string;

    @Column({ type: "tinyint", nullable: false })
    type!: number;

    @Column({ nullable: false, default: 1 })
    active!: boolean;

    @ManyToOne(() => Users, (user) => user.id)
    @JoinColumn({ name: "user_id" })
    user!: Users;

    @CreateDateColumn()
    createdAt!: Date;

    @UpdateDateColumn()
    updatedAt!: Date;
}
