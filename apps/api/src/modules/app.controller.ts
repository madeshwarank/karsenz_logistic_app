import { Controller, Get } from '@nestjs/common';
import { Public } from './security';

@Controller()
export class AppController {
  @Public()
  @Get('health')
  health() {
    return { data: { ok: true, service: 'karsenz-api', timestamp: new Date().toISOString() } };
  }
}
