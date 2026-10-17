import {
  Check,
  Column,
  Entity,
  Index,
  PrimaryGeneratedColumn,
} from 'typeorm';

@Entity('licencias')
@Check('chk_licencias_estado', `estado IN ('activa','revocada')`)
@Index('idx_licencias_usuario_sub', ['usuarioSub'])
@Index('uq_licencias_activa', ['usuarioSub', 'juegoId'], {
  unique: true,
  where: `estado = 'activa'`,
})
export class Licencia {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'juego_id', type: 'varchar', length: 64 })
  juegoId: string;

  @Column({ name: 'usuario_sub', type: 'varchar', length: 128 })
  usuarioSub: string;

  @Column({ type: 'varchar', length: 16, default: 'activa' })
  estado: 'activa' | 'revocada';

  @Column({ name: 'adquirida_en', type: 'timestamptz' })
  adquiridaEn: Date;

  @Column({ name: 'revocada_en', type: 'timestamptz', nullable: true })
  revocadaEn: Date | null;

  @Column({ name: 'revocada_por', type: 'varchar', length: 128, nullable: true })
  revocadaPor: string | null;
}
