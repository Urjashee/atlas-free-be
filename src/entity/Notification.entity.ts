import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    CreateDateColumn,
    UpdateDateColumn,
    ManyToOne,
    JoinColumn,
} from "typeorm";
import { Users } from "./Users.entity";

@Entity({ name: "notifications" })
export class Notifications {
    @PrimaryGeneratedColumn()
    id!: number;

    @Column({
        name: "email_subject",
        type: "varchar",
        length: 255,
    })
    emailSubject!: string;

    @Column({
        name: "email_body",
        type: "text",
    })
    emailBody!: string;

    @Column({
        name: "notification_type",
        type: "int",
    })
    notificationType!: number;

    @ManyToOne(() => Users, (user) => user.id, {
        nullable: false,
        onDelete: "CASCADE",
        onUpdate: "CASCADE",
    })
    @JoinColumn({ name: "user_id" })
    user!: Users;

    @CreateDateColumn({
        name: "created_at",
    })
    createdAt!: Date;

    @UpdateDateColumn({
        name: "updated_at",
    })
    updatedAt!: Date;
}