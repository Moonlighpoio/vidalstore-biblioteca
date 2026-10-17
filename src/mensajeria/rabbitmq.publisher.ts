import { Injectable, Logger, OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { connect, ChannelModel, ConfirmChannel } from 'amqplib';
import { randomUUID } from 'node:crypto';
import {
  EXCHANGES,
  EXCHANGE_TYPES,
  EVENTO_CONTENT_TYPE,
  HEADERS,
} from './topologia';

export interface PublicarEventoInput {
  routingKey: string;
  payload: Record<string, unknown>;
  eventoId?: string;
}

@Injectable()
export class RabbitMqPublisher implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(RabbitMqPublisher.name);
  private connection?: ChannelModel;
  private channel?: ConfirmChannel;
  private connecting?: Promise<ConfirmChannel>;

  constructor(private readonly configService: ConfigService) {}

  async onModuleInit(): Promise<void> {
    try {
      await this.getChannel();
    } catch (error) {
      this.logger.error(
        `No se pudo conectar a RabbitMQ al arrancar: ${(error as Error).message}`,
      );
    }
  }

  async onModuleDestroy(): Promise<void> {
    try {
      await this.channel?.close();
      await this.connection?.close();
    } catch {
      // ignore
    }
  }

  private get url(): string {
    return this.configService.get<string>(
      'RABBITMQ_URL',
      'amqp://localhost:5672',
    );
  }

  private async getChannel(): Promise<ConfirmChannel> {
    if (this.channel) {
      return this.channel;
    }

    if (!this.connecting) {
      this.connecting = this.connectChannel();
    }

    try {
      this.channel = await this.connecting;
      return this.channel;
    } finally {
      this.connecting = undefined;
    }
  }

  private async connectChannel(): Promise<ConfirmChannel> {
    const connection = await connect(this.url);
    connection.on('error', (error) =>
      this.logger.error(`Error de conexión RabbitMQ: ${error.message}`),
    );
    connection.on('close', () => {
      this.logger.warn('Conexión RabbitMQ cerrada');
      this.connection = undefined;
      this.channel = undefined;
    });

    const channel = await connection.createConfirmChannel();

    await channel.assertExchange(EXCHANGES.eventos, EXCHANGE_TYPES.eventos, {
      durable: true,
    });

    this.connection = connection;
    return channel;
  }

  async publishEvento({
    routingKey,
    payload,
    eventoId,
  }: PublicarEventoInput): Promise<void> {
    const channel = await this.getChannel();
    const headers = {
      [HEADERS.eventoId]: eventoId ?? randomUUID(),
      [HEADERS.emitidoEn]: new Date().toISOString(),
    };

    channel.publish(
      EXCHANGES.eventos,
      routingKey,
      Buffer.from(JSON.stringify(payload)),
      {
        persistent: true,
        contentType: EVENTO_CONTENT_TYPE,
        headers,
      },
    );

    await channel.waitForConfirms();
  }
}
