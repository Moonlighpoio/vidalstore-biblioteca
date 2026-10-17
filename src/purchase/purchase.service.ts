import { BadRequestException, Injectable, Logger } from '@nestjs/common';
import { LicenciasRepository } from '../licenses/licencias.repository';
import { RabbitMqPublisher } from '../mensajeria/rabbitmq.publisher';
import { ROUTING_KEYS } from '../mensajeria/topologia';
import { LicenseResponse } from '../library/library.service';

export interface CreatePurchaseDto {
  usuarioSub: string;
  juegoId: string;
}

@Injectable()
export class PurchaseService {
  private readonly logger = new Logger(PurchaseService.name);

  constructor(
    private readonly repository: LicenciasRepository,
    private readonly publisher: RabbitMqPublisher,
  ) {}

  async createPurchase(dto: CreatePurchaseDto): Promise<LicenseResponse> {
    const existing = await this.repository.findActiveByUsuarioSubAndJuego(
      dto.usuarioSub,
      dto.juegoId,
    );

    if (existing) {
      throw new BadRequestException('Game already purchased by this user');
    }

    const adquiridaEn = new Date();

    const license = await this.repository.save(
      this.repository.create({
        usuarioSub: dto.usuarioSub,
        juegoId: dto.juegoId,
        estado: 'activa',
        adquiridaEn,
        revocadaEn: null,
        revocadaPor: null,
      }),
    );

    await this.publisher.publishEvento({
      routingKey: ROUTING_KEYS.compraRealizada,
      payload: {
        licenciaId: license.id,
        juegoId: license.juegoId,
        usuarioSub: license.usuarioSub,
        adquiridaEn: license.adquiridaEn.toISOString(),
      },
    });

    return {
      id: license.id,
      userId: license.usuarioSub,
      gameId: license.juegoId,
      gameTitle: license.juegoId,
      purchasedAt: license.adquiridaEn.toISOString(),
      revoked: false,
      revokedAt: null,
      revokedBy: null,
      estado: license.estado,
    };
  }
}
