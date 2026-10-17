import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Licencia } from './entities/licencia.entity';

@Injectable()
export class LicenciasRepository {
  constructor(
    @InjectRepository(Licencia)
    private readonly repository: Repository<Licencia>,
  ) {}

  findActiveByUsuarioSub(usuarioSub: string): Promise<Licencia[]> {
    return this.repository.find({
      where: { usuarioSub, estado: 'activa' },
      order: { adquiridaEn: 'ASC' },
    });
  }

  findByUsuarioSub(usuarioSub: string): Promise<Licencia[]> {
    return this.repository.find({
      where: { usuarioSub },
      order: { adquiridaEn: 'ASC' },
    });
  }

  findActiveByUsuarioSubAndJuego(
    usuarioSub: string,
    juegoId: string,
  ): Promise<Licencia | null> {
    return this.repository.findOne({
      where: { usuarioSub, juegoId, estado: 'activa' },
    });
  }

  findAll(): Promise<Licencia[]> {
    return this.repository.find({ order: { adquiridaEn: 'DESC' } });
  }

  findById(id: string): Promise<Licencia | null> {
    return this.repository.findOne({ where: { id } });
  }

  save(licencia: Licencia): Promise<Licencia> {
    return this.repository.save(licencia);
  }

  create(partial: Partial<Licencia>): Licencia {
    return this.repository.create(partial);
  }
}
