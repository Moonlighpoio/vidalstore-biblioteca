export interface License {
  id: string;
  userId: string;
  gameId: string;
  purchasedAt: string;
  revoked: boolean;
  revokedAt?: string;
  revokedBy?: string;
}