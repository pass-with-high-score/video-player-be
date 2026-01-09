import {
    Controller,
    Get,
    Post,
    Body,
    Param,
    Patch,
    Query,
    UseGuards,
    HttpCode,
    HttpStatus,
} from '@nestjs/common';
import { VideosService } from './videos.service';
import { CreateVideoDto, UpdateVideoDto, FeedQueryDto } from './dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser, Public } from '../../common/decorators';
import { User } from '../users/entities/user.entity';

@Controller('videos')
@UseGuards(JwtAuthGuard)
export class VideosController {
    constructor(private readonly videosService: VideosService) { }

    @Post('upload')
    async upload(
        @CurrentUser() user: User,
        @Body() createVideoDto: CreateVideoDto,
    ) {
        return this.videosService.createVideo(user.id, createVideoDto);
    }

    @Post(':id/confirm')
    @HttpCode(HttpStatus.OK)
    async confirmUpload(@Param('id') id: string, @CurrentUser() user: User) {
        return this.videosService.confirmUpload(id, user.id);
    }

    @Get(':id')
    @Public()
    async findOne(@Param('id') id: string) {
        return this.videosService.findById(id);
    }

    @Patch(':id')
    async update(
        @Param('id') id: string,
        @CurrentUser() user: User,
        @Body() updateVideoDto: UpdateVideoDto,
    ) {
        return this.videosService.updateVideo(id, user.id, updateVideoDto);
    }

    @Post(':id/view')
    @Public()
    @HttpCode(HttpStatus.NO_CONTENT)
    async incrementView(@Param('id') id: string) {
        await this.videosService.incrementView(id);
    }
}

@Controller('feed')
export class FeedController {
    constructor(private readonly videosService: VideosService) { }

    @Get()
    @Public()
    async getFeed(@Query() feedQueryDto: FeedQueryDto) {
        return this.videosService.getFeed(feedQueryDto);
    }
}
