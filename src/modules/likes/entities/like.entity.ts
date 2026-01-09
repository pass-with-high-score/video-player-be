import {
    Entity,
    PrimaryColumn,
    CreateDateColumn,
    ManyToOne,
    JoinColumn,
} from 'typeorm';
import { User } from '../../users/entities/user.entity';
import { Video } from '../../videos/entities/video.entity';

@Entity('likes')
export class Like {
    @PrimaryColumn()
    userId: string;

    @PrimaryColumn()
    videoId: string;

    @ManyToOne(() => User, (user: User) => user.likes, { onDelete: 'CASCADE' })
    @JoinColumn({ name: 'userId' })
    user: User;

    @ManyToOne(() => Video, (video: Video) => video.likes, { onDelete: 'CASCADE' })
    @JoinColumn({ name: 'videoId' })
    video: Video;

    @CreateDateColumn()
    createdAt: Date;
}
