import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { UsersService } from 'src/users/users.service';
import { Repository } from 'typeorm';
import { SigninDto, SignupDto } from './dto';
import { JwtTokens } from './types';
import { AuthSession } from './entities/auth-session.entity';
import * as bcrypt from 'bcrypt';
import {
  HttpException,
  UnauthorizedException,
} from '@nestjs/common/exceptions';
import { HttpStatus } from '@nestjs/common/enums';
import { JwtService } from '@nestjs/jwt/dist';
import { User } from 'src/users/entities/user.entity';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(AuthSession)
    private authSessionRepo: Repository<AuthSession>,
    private usersService: UsersService,
    private jwtService: JwtService,
  ) {}

  async signupLocal(dto: SignupDto): Promise<JwtTokens> {
    const userAlreadyExist = await this.usersService.findOneByEmail(dto.email);
    if (userAlreadyExist) {
      throw new HttpException('Conflict', HttpStatus.CONFLICT);
    }
    const user = await this.usersService.create(dto);
    const authSession = await this.create(user.id);
    const tokens = await this.getTokens(user.id, authSession.id, user.email);
    await this.updateRefreshToken(authSession.id, tokens.refreshToken);
    return tokens;
  }

  async signinLocal(dto: SigninDto): Promise<JwtTokens> {
    const user = await this.validateUser(dto);
    const authSession = await this.create(user.id);
    const tokens = await this.getTokens(user.id, authSession.id, user.email);
    await this.updateRefreshToken(authSession.id, tokens.refreshToken);
    return tokens;
  }

  async refresh(
    userId: string,
    authSessionId: string,
    refreshToken: string,
  ): Promise<JwtTokens> {
    const authSession = await this.authSessionRepo.findOne({
      relations: ['user'],
      where: { id: authSessionId, user: { id: userId } },
    });
    if (!authSession) {
      throw new UnauthorizedException();
    }
    const refreshTokenMatch = await bcrypt.compare(
      refreshToken,
      authSession.hashedRefreshToken,
    );
    if (!refreshTokenMatch) {
      throw new UnauthorizedException();
    }
    const tokens = await this.getTokens(
      authSession.user.id,
      authSession.id,
      authSession.user.email,
    );
    await this.updateRefreshToken(authSession.id, tokens.refreshToken);
    return tokens;
  }

  async logout(authSessionId: string): Promise<void> {
    await this.authSessionRepo.delete(authSessionId);
    return;
  }

  /**
   * UTILS
   */

  async create(userId: string): Promise<AuthSession> {
    const authSession = this.authSessionRepo.create({
      user: { id: userId },
    });
    return this.authSessionRepo.save(authSession);
  }

  async updateRefreshToken(
    authSessionId: string,
    refreshToken: string,
  ): Promise<void> {
    await this.authSessionRepo.update(authSessionId, {
      hashedRefreshToken: await bcrypt.hash(refreshToken, 5),
    });
    return;
  }

  async getTokens(
    userId: string,
    sessionId: string,
    email: string,
  ): Promise<JwtTokens> {
    const [accessToken, refreshToken] = await Promise.all([
      this.jwtService.signAsync(
        {
          sub: userId,
          sessionId,
          email,
        },
        {
          expiresIn: +process.env.JWT_ACCESS_EXPIRES_IN_MINUTE * 60,
          secret: process.env.JWT_ACCESS_SECRET,
        },
      ),
      this.jwtService.signAsync(
        {
          sub: userId,
          sessionId,
          email,
        },
        {
          expiresIn: +process.env.JWT_REFRESH_EXPIRES_IN_DAY * 60 * 60 * 24,
          secret: process.env.JWT_REFRESH_SECRET,
        },
      ),
    ]);

    return {
      accessToken,
      refreshToken,
    };
  }

  async validateUser(dto: SigninDto): Promise<User> {
    const user = await this.usersService.findOneByEmail(dto.email);
    if (!user) {
      throw new HttpException('Not Found', HttpStatus.NOT_FOUND);
    }
    const isMatch = await bcrypt.compare(dto.password, user.hashedPassword);
    if (!isMatch) {
      throw new UnauthorizedException();
    }
    return user;
  }
}
