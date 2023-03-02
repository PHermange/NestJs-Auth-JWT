import { ApiProperty } from '@nestjs/swagger/dist/decorators/api-property.decorator';

export class JwtTokens {
  @ApiProperty()
  accessToken: string;
  @ApiProperty()
  refreshToken: string;
}
