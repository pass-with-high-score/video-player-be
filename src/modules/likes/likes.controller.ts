import {
    Controller,
    Post,
    Delete,
    Get,
    Param,
    UseGuards,
    HttpCode,
    HttpStatus,
} from '@nestjs/common';
import { LikesService } from './likes.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../../common/decorators';
import { User } from '../users/entities/user.entity';

@Controller('videos/:videoId/like')
@UseGuards(JwtAuthGuard)
export class LikesController {
    constructor(private readonly likesService: LikesService) { }

    @Post()
    @HttpCode(HttpStatus.OK)
    async like(@Param('videoId') videoId: string, @CurrentUser() user: User) {
        return this.likesService.like(user.id, videoId);
    }

    @Delete()
    @HttpCode(HttpStatus.OK)
    async unlike(@Param('videoId') videoId: string, @CurrentUser() user: User) {
        return this.likesService.unlike(user.id, videoId);
    }

    @Get('status')
    async isLiked(@Param('videoId') videoId: string, @CurrentUser() user: User) {
        const liked = await this.likesService.isLiked(user.id, videoId);
        return { liked };
    }
}
