import type { RefreshToken } from '@db/client';
import type { TokenProfile } from '@/domain/model';

export interface IRefreshTokenRepository {
  create: (data: TokenProfile) => Promise<RefreshToken>;
  revoke: (token: string) => Promise<RefreshToken>;
}
