import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Comment } from './entities/comment.entity';
import { CreateCommentDto } from './dto/create-comment.dto';

@Injectable()
export class CommentsService {
    constructor(
        @InjectRepository(Comment)
        private readonly commentsRepository: Repository<Comment>,
    ) { }

    async create(
        userId: string,
        videoId: string,
        createCommentDto: CreateCommentDto,
    ): Promise<Comment> {
        const comment = this.commentsRepository.create({
            userId,
            videoId,
            content: createCommentDto.content,
        });
        const saved = await this.commentsRepository.save(comment);
        return this.findById(saved.id);
    }

    async findByVideoId(
        videoId: string,
        limit = 20,
        cursor?: string,
    ): Promise<{ comments: Comment[]; nextCursor: string | null }> {
        const queryBuilder = this.commentsRepository
            .createQueryBuilder('comment')
            .leftJoinAndSelect('comment.user', 'user')
            .where('comment.videoId = :videoId', { videoId })
            .orderBy('comment.createdAt', 'DESC')
            .take(limit + 1);

        if (cursor) {
            const cursorComment = await this.commentsRepository.findOne({
                where: { id: cursor },
            });
            if (cursorComment) {
                queryBuilder.andWhere('comment.createdAt < :createdAt', {
                    createdAt: cursorComment.createdAt,
                });
            }
        }

        const comments = await queryBuilder.getMany();
        const hasMore = comments.length > limit;
        if (hasMore) {
            comments.pop();
        }

        return {
            comments,
            nextCursor: hasMore ? comments[comments.length - 1].id : null,
        };
    }

    async findById(id: string): Promise<Comment> {
        const comment = await this.commentsRepository.findOne({
            where: { id },
            relations: ['user'],
        });
        if (!comment) {
            throw new NotFoundException('Comment not found');
        }
        return comment;
    }

    async delete(id: string, userId: string): Promise<void> {
        const comment = await this.findById(id);
        if (comment.userId !== userId) {
            throw new NotFoundException('Comment not found');
        }
        await this.commentsRepository.delete(id);
    }
}
