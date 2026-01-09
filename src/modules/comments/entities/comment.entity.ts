import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    CreateDateColumn,
    ManyToOne,
    JoinColumn,
} from 'typeorm';
import { User } from '../../users/entities/user.entity';
import { Video } from '../../videos/entities/video.entity';

@Entity('comments')
export class Comment {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column()
    userId: string;

    @Column()
    videoId: string;

    @ManyToOne(() => User, (user: User) => user.comments, { onDelete: 'CASCADE' })
    @JoinColumn({ name: 'userId' })
    user: User;

    @ManyToOne(() => Video, (video: Video) => video.comments, { onDelete: 'CASCADE' })
    @JoinColumn({ name: 'videoId' })
    video: Video;

    @Column('text')
    content: string;

    @CreateDateColumn()
    createdAt: Date;
}
