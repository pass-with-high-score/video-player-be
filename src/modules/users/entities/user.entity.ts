import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    CreateDateColumn,
    OneToMany,
} from 'typeorm';
import { Video } from '../../videos/entities/video.entity';
import { Like } from '../../likes/entities/like.entity';
import { Comment } from '../../comments/entities/comment.entity';
import { Exclude } from 'class-transformer';

@Entity('users')
export class User {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column({ unique: true })
    username: string;

    @Column({ unique: true })
    email: string;

    @Column()
    @Exclude()
    passwordHash: string;

    @Column({ nullable: true })
    avatarUrl: string;

    @CreateDateColumn()
    createdAt: Date;

    @OneToMany(() => Video, (video: Video) => video.user)
    videos: Video[];

    @OneToMany(() => Like, (like: Like) => like.user)
    likes: Like[];

    @OneToMany(() => Comment, (comment: Comment) => comment.user)
    comments: Comment[];
}
