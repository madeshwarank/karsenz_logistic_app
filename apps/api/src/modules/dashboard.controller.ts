import { Controller, Get, Header, Param, Query } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { DashboardService } from './dashboard.service';

@ApiTags('Dashboard and reports')
@ApiBearerAuth()
@Controller()
export class DashboardController {
  constructor(private readonly dashboard: DashboardService) {}

  @Get('dashboard/summary')
  async summary() {
    return { data: await this.dashboard.summary() };
  }

  @Get('reports/:name')
  async report(@Param('name') name: string, @Query() query: Record<string, string>) {
    return { data: await this.dashboard.report(name, query) };
  }

  @Get('reports/:name.csv')
  @Header('content-type', 'text/csv')
  async reportCsv(@Param('name') name: string, @Query() query: Record<string, string>) {
    const report = await this.dashboard.report(name, query);
    return this.dashboard.toCsv(report.rows);
  }
}
