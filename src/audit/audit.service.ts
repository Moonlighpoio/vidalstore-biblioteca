import { Injectable } from '@nestjs/common';
import { AuditRecord } from './entities/audit-record.entity';

@Injectable()
export class AuditService {
  private readonly records: AuditRecord[] = [];

  recordRevocation(input: Omit<AuditRecord, 'id' | 'revokedAt'>) {
    const record: AuditRecord = {
      id: crypto.randomUUID(),
      revokedAt: new Date().toISOString(),
      ...input,
    };

    this.records.push(record);
    return record;
  }

  findAll(): AuditRecord[] {
    return [...this.records];
  }
}