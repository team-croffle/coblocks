import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { passportJwtSecret } from 'jwks-rsa';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { TypedSocket } from '@/types/socket.types';

interface JwtPayload {
  sub: string; // 사용자 ID
  name: string; // Better Auth JWT의 사용자 이름 클레임
}

// 소켓 연결 요청의 handshake에서 토큰을 추출하는 함수
const fromSocketAuth = (client: TypedSocket): string | null => {
  return client.handshake.auth.token || null;
};

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(private readonly configService: ConfigService) {
    const betterAuthUrl = configService.get<string>('BETTER_AUTH_URL')!;

    super({
      jwtFromRequest: ExtractJwt.fromExtractors([fromSocketAuth]),
      ignoreExpiration: false,
      // Better Auth JWT 플러그인은 RSA 키쌍으로 서명 → JWKS로 공개키를 검증
      secretOrKeyProvider: passportJwtSecret({
        cache: true, // 공개키를 캐시하여 매 요청마다 JWKS 호출 방지
        rateLimit: true,
        jwksRequestsPerMinute: 10,
        jwksUri: `${betterAuthUrl}/api/auth/jwks`,
      }),
    });
  }

  validate(payload: JwtPayload) {
    return {
      userId: payload.sub,
      userName: payload.name,
    };
  }
}
