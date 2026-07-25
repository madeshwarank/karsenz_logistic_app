import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { APP_GUARD } from '@nestjs/core';
import { JwtModule } from '@nestjs/jwt';
import { ThrottlerGuard, ThrottlerModule } from '@nestjs/throttler';
import { AppController } from './app.controller';
import { AuthController } from './auth.controller';
import { BookingController } from './booking.controller';
import { CoreDataController } from './core-data.controller';
import { DashboardController } from './dashboard.controller';
import { PrismaService } from './prisma.service';
import { AuthService } from './auth.service';
import { BookingService } from './booking.service';
import { DashboardService } from './dashboard.service';
import { JwtAuthGuard } from './security';
import { StorageService } from './storage.service';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    ThrottlerModule.forRoot([{ ttl: 60_000, limit: 20 }]),
    JwtModule.register({ global: true }),
  ],
  controllers: [AppController, AuthController, BookingController, CoreDataController, DashboardController],
  providers: [
    PrismaService,
    AuthService,
    BookingService,
    DashboardService,
    StorageService,
    { provide: APP_GUARD, useClass: ThrottlerGuard },
    { provide: APP_GUARD, useClass: JwtAuthGuard },
  ],
})
export class AppModule {}
