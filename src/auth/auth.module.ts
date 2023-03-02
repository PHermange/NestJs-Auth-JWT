import { Module } from '@nestjs/common';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthSession } from './entities/auth-session.entity';
import { UsersModule } from 'src/users/users.module';
import { AccessJWTStrategy, RefreshJWTStrategy } from './strategies';
import { JwtModule } from '@nestjs/jwt';

@Module({
  imports: [
    JwtModule.register({}),
    TypeOrmModule.forFeature([AuthSession]),
    UsersModule,
  ],
  controllers: [AuthController],
  providers: [AuthService, AccessJWTStrategy, RefreshJWTStrategy],
})
export class AuthModule {}
