import { Injectable } from '@nestjs/common';
import { Licencia } from '../licenses/entities/licencia.entity';
import { LicenciasRepository } from '../licenses/licencias.repository';
import { GameNamesService } from './game-names.service';

export interface LicenseResponse {
  id: string;
  userId: string;
  gameId: string;
  gameTitle: string;
  purchasedAt: string;
  revoked: boolean;
  revokedAt: string | null;
  revokedBy: string | null;
  estado: 'activa' | 'revocada';
}

export interface LibraryResponse {
  userId: string;
  licenses: LicenseResponse[];
  total: number;
}

@Injectable()
export class LibraryService {
  constructor(
    private readonly repository: LicenciasRepository,
    private readonly gameNames: GameNamesService,
  ) {}

  async findByUserId(userId: string): Promise<LibraryResponse> {
    const licenses = await this.repository.findActiveByUsuarioSub(userId);

    return {
      userId,
      licenses: licenses.map((license) => this.toResponse(license)),
      total: licenses.length,
    };
  }

  toResponse(license: Licencia): LicenseResponse {
    return {
      id: license.id,
      userId: license.usuarioSub,
      gameId: license.juegoId,
      gameTitle: this.gameNames.resolve(license.juegoId),
      purchasedAt: license.adquiridaEn.toISOString(),
      revoked: license.estado === 'revocada',
      revokedAt: license.revocadaEn ? license.revocadaEn.toISOString() : null,
      revokedBy: license.revocadaPor ?? null,
      estado: license.estado,
    };
  }
}
