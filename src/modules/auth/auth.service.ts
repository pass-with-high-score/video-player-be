import {
    Injectable,
    UnauthorizedException,
    ConflictException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import * as bcrypt from 'bcrypt';
import { UsersService } from '../users/users.service';
import { RegisterDto, LoginDto } from './dto';

export interface JwtPayload {
    sub: string;
    email: string;
}

export interface TokenResponse {
    accessToken: string;
    refreshToken: string;
}

@Injectable()
export class AuthService {
    constructor(
        private readonly usersService: UsersService,
        private readonly jwtService: JwtService,
        private readonly configService: ConfigService,
    ) { }

    async register(registerDto: RegisterDto): Promise<TokenResponse> {
        const { username, email, password } = registerDto;

        // Check if user exists
        const existingEmail = await this.usersService.findByEmail(email);
        if (existingEmail) {
            throw new ConflictException('Email already exists');
        }

        const existingUsername = await this.usersService.findByUsername(username);
        if (existingUsername) {
            throw new ConflictException('Username already exists');
        }

        // Hash password
        const passwordHash = await bcrypt.hash(password, 10);

        // Create user
        const user = await this.usersService.create({
            username,
            email,
            passwordHash,
        });

        return this.generateTokens(user.id, user.email);
    }

    async login(loginDto: LoginDto): Promise<TokenResponse> {
        const { email, password } = loginDto;

        const user = await this.usersService.findByEmail(email);
        if (!user) {
            throw new UnauthorizedException('Invalid credentials');
        }

        const isPasswordValid = await bcrypt.compare(password, user.passwordHash);
        if (!isPasswordValid) {
            throw new UnauthorizedException('Invalid credentials');
        }

        return this.generateTokens(user.id, user.email);
    }

    async refreshToken(refreshToken: string): Promise<TokenResponse> {
        try {
            const payload = this.jwtService.verify<JwtPayload>(refreshToken, {
                secret: this.configService.get<string>('JWT_REFRESH_SECRET'),
            });

            const user = await this.usersService.findById(payload.sub);
            if (!user) {
                throw new UnauthorizedException('User not found');
            }

            return this.generateTokens(user.id, user.email);
        } catch {
            throw new UnauthorizedException('Invalid refresh token');
        }
    }

    private generateTokens(userId: string, email: string): TokenResponse {
        const payload: JwtPayload = { sub: userId, email };

        const accessToken = this.jwtService.sign(payload, {
            secret: this.configService.get<string>('JWT_SECRET'),
            expiresIn: 900, // 15 minutes in seconds
        });

        const refreshToken = this.jwtService.sign(payload, {
            secret: this.configService.get<string>('JWT_REFRESH_SECRET'),
            expiresIn: 604800, // 7 days in seconds
        });

        return { accessToken, refreshToken };
    }
}
