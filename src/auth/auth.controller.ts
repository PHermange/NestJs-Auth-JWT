import { Controller, Post, Delete, Body, Req } from '@nestjs/common';
import { UseGuards } from '@nestjs/common/decorators/core/use-guards.decorator';
import { AuthService } from './auth.service';
import { SessionOwner } from './decorators';
import { SigninDto, SignupDto } from './dto';
import { JwtTokens, Owner } from './types';
import { AccessJwtGuard } from './guards/access-jwt.guard';
import { RefreshJwtGuard } from './guards/refresh-jwt.guard';
import { ApiResponse, ApiTags } from '@nestjs/swagger/dist';
import { ApiBearerAuth } from '@nestjs/swagger/dist/decorators/api-bearer.decorator';

@ApiTags('Auth')
@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @ApiResponse({ type: JwtTokens })
  @Post('local/signup')
  async signupLocal(@Body() dto: SignupDto): Promise<JwtTokens> {
    return this.authService.signupLocal(dto);
  }

  @ApiResponse({ type: JwtTokens })
  @Post('local/signin')
  async signinLocal(@Body() dto: SigninDto): Promise<JwtTokens> {
    return this.authService.signinLocal(dto);
  }

  @ApiResponse({ type: JwtTokens })
  @ApiBearerAuth()
  @UseGuards(RefreshJwtGuard)
  @Post('refresh')
  async refresh(@SessionOwner() owner: Owner): Promise<JwtTokens> {
    return this.authService.refresh(
      owner.sub,
      owner.sessionId,
      owner.refreshToken,
    );
  }

  @ApiResponse({ type: 'void' })
  @ApiBearerAuth()
  @UseGuards(AccessJwtGuard)
  @Delete('logout')
  async logout(@SessionOwner() owner: Owner): Promise<void> {
    await this.authService.logout(owner.sessionId);
    return;
  }
}
