import { Injectable, NotFoundException } from '@nestjs/common';
import { LicenciasRepository } from './licencias.repository';
import { Licencia } from './entities/licencia.entity';
import { RabbitMqPublisher } from '../mensajeria/rabbitmq.publisher';
import { ROUTING_KEYS } from '../mensajeria/topologia';

@Injectable()
export class LicensesService {
  constructor(
    private readonly repository: LicenciasRepository,
    private readonly publisher: RabbitMqPublisher,
  ) {}

  findAll(): Promise<Licencia[]> {
    return this.repository.findAll();
  }

  async revokeLicense(
    licenseId: string,
    revokedBy: string,
    motivo = 'Sin motivo indicado',
  ): Promise<Licencia> {
    const license = await this.repository.findById(licenseId);

    if (!license) {
      throw new NotFoundException('License not found');
    }

    if (license.estado === 'revocada') {
      return license;
    }

    license.estado = 'revocada';
    license.revocadaEn = new Date();
    license.revocadaPor = revokedBy;

    const saved = await this.repository.save(license);

    await this.publisher.publishEvento({
      routingKey: ROUTING_KEYS.licenciaRevocada,
      payload: {
        licenciaId: saved.id,
        juegoId: saved.juegoId,
        usuarioSub: saved.usuarioSub,
        revocadaPor: revokedBy,
        motivo,
      },
    });

    return saved;
  }
}
