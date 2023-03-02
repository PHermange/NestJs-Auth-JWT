import { Controller, Post, Delete, Body, Req } from '@nestjs/common';
import { UseGuards } from '@nestjs/common/decorators/core/use-guards.decorator';
import { AuthService } from './auth.service';
import { SessionOwner } from './decorators';
import { SigninDto, SignupDto } from './dto';
import { JwtTokens, Owner } from './types';
import { AccessJwtGuard } from './guards/access-jwt.guard';
import { RefreshJwtGuard } from './guards/refresh-jwt.guard';

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Post('local/signup')
  async signupLocal(@Body() dto: SignupDto): Promise<JwtTokens> {
    return this.authService.signupLocal(dto);
  }

  @Post('local/signin')
  async signinLocal(@Body() dto: SigninDto): Promise<JwtTokens> {
    return this.authService.signinLocal(dto);
  }

  @UseGuards(RefreshJwtGuard)
  @Post('refresh')
  async refresh(@SessionOwner() owner: Owner): Promise<JwtTokens> {
    return this.authService.refresh(
      owner.sub,
      owner.sessionId,
      owner.refreshToken,
    );
  }

  @UseGuards(AccessJwtGuard)
  @Delete('logout')
  async logout(@SessionOwner() owner: Owner) {
    await this.authService.logout(owner.sessionId);
    return;
  }
}
