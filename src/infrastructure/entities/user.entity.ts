import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn } from 'typeorm';

export enum UserRole {
    DEVELOPER = 'developer',
    ADMIN = 'admin',
} 


@Entity('users')
export class User {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column({ unique: true })
    email: string;

    @Column()
    name: string;

    @Column({
        type: 'enum',
        enum: UserRole,
        default: UserRole.DEVELOPER
    })
    role: UserRole;

    @CreateDateColumn()
    createdAt: Date;
} 
