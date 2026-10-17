import { Injectable } from '@nestjs/common';
import { LicenciasRepository } from '../licenses/licencias.repository';
import { AuditRecord } from './entities/audit-record.entity';

@Injectable()
export class AuditService {
  constructor(private readonly repository: LicenciasRepository) {}

  async findAll(): Promise<AuditRecord[]> {
    const revoked = (await this.repository.findAll()).filter(
      (license) => license.estado === 'revocada',
    );

    return revoked.map((license) => ({
      id: license.id,
      licenseId: license.id,
      gameId: license.juegoId,
      userId: license.usuarioSub,
      revokedBy: license.revocadaPor ?? 'desconocido',
      revokedAt: (license.revocadaEn ?? license.adquiridaEn).toISOString(),
    }));
  }
}
