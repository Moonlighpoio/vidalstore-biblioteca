import {
  Controller,
  Get,
} from '@nestjs/common';
import { LicensesService } from './licenses.service';

@Controller('licencias')
export class LicensesController {
  constructor(
    private readonly licensesService: LicensesService,
  ) {}

  @Get()
  findAll() {
    return this.licensesService.findAll();
  }
}