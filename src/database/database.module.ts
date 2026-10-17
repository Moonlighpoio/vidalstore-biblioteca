import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Licencia } from '../licenses/entities/licencia.entity';

export const DB_SCHEMA = 'licencias';

@Module({
  imports: [
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        type: 'postgres',
        host: configService.get<string>('DB_HOST', 'localhost'),
        port: configService.get<number>('DB_PORT', 5432),
        username: configService.get<string>('DB_USER', 'vidalstore'),
        password: configService.get<string>('DB_PASSWORD', 'vidalstore'),
        database: configService.get<string>('DB_NAME', 'vidalstore'),
        schema: configService.get<string>('DB_SCHEMA', DB_SCHEMA),
        entities: [Licencia],
        synchronize:
          configService.get<string>('NODE_ENV', 'development') !==
          'production',
      }),
    }),
  ],
})
export class DatabaseModule {}
