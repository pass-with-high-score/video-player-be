import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import {
    S3Client,
    PutObjectCommand,
    GetObjectCommand,
} from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';

@Injectable()
export class S3Service {
    private readonly s3Client: S3Client;
    private readonly bucket: string;

    constructor(private readonly configService: ConfigService) {
        this.s3Client = new S3Client({
            endpoint: this.configService.get<string>('S3_ENDPOINT'),
            region: this.configService.get<string>('S3_REGION') || 'us-east-1',
            credentials: {
                accessKeyId: this.configService.get<string>('S3_ACCESS_KEY') || '',
                secretAccessKey: this.configService.get<string>('S3_SECRET_KEY') || '',
            },
            forcePathStyle: true, // Required for MinIO
        });
        this.bucket = this.configService.get<string>('S3_BUCKET') || 'videos';
    }

    async getUploadSignedUrl(
        key: string,
        contentType: string,
        expiresIn = 3600,
    ): Promise<string> {
        const command = new PutObjectCommand({
            Bucket: this.bucket,
            Key: key,
            ContentType: contentType,
        });
        return getSignedUrl(this.s3Client, command, { expiresIn });
    }

    async getDownloadSignedUrl(key: string, expiresIn = 3600): Promise<string> {
        const command = new GetObjectCommand({
            Bucket: this.bucket,
            Key: key,
        });
        return getSignedUrl(this.s3Client, command, { expiresIn });
    }

    getPublicUrl(key: string): string {
        const endpoint = this.configService.get<string>('S3_ENDPOINT');
        return `${endpoint}/${this.bucket}/${key}`;
    }
}
