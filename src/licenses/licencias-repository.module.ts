import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Licencia } from './entities/licencia.entity';
import { LicenciasRepository } from './licencias.repository';

@Module({
  imports: [TypeOrmModule.forFeature([Licencia])],
  providers: [LicenciasRepository],
  exports: [LicenciasRepository],
})
export class LicenciasRepositoryModule {}
