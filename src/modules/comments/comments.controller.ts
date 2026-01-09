import {
    Controller,
    Get,
    Post,
    Delete,
    Body,
    Param,
    Query,
    UseGuards,
    HttpCode,
    HttpStatus,
} from '@nestjs/common';
import { CommentsService } from './comments.service';
import { CreateCommentDto } from './dto/create-comment.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser, Public } from '../../common/decorators';
import { User } from '../users/entities/user.entity';

@Controller('videos/:videoId/comments')
export class CommentsController {
    constructor(private readonly commentsService: CommentsService) { }

    @Get()
    @Public()
    async findByVideoId(
        @Param('videoId') videoId: string,
        @Query('limit') limit?: string,
        @Query('cursor') cursor?: string,
    ) {
        return this.commentsService.findByVideoId(
            videoId,
            limit ? parseInt(limit, 10) : 20,
            cursor,
        );
    }

    @Post()
    @UseGuards(JwtAuthGuard)
    async create(
        @Param('videoId') videoId: string,
        @CurrentUser() user: User,
        @Body() createCommentDto: CreateCommentDto,
    ) {
        return this.commentsService.create(user.id, videoId, createCommentDto);
    }

    @Delete(':id')
    @UseGuards(JwtAuthGuard)
    @HttpCode(HttpStatus.NO_CONTENT)
    async delete(@Param('id') id: string, @CurrentUser() user: User) {
        await this.commentsService.delete(id, user.id);
    }
}
