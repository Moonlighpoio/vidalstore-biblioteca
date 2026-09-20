export interface AuditRecord {
  id: string;
  licenseId: string;
  gameId: string;
  userId: string;
  revokedBy: string;
  revokedAt: string;
}