import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { PrismaService } from './prisma.service';

const DEV_PASSWORD = 'Karsenz@123';

@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jwt: JwtService,
  ) {}

  async login(email: string, password: string) {
    const user = await this.prisma.user.findUnique({
      where: { email },
      include: { roles: { include: { role: true } }, driverProfile: true },
    });
    if (!user?.isActive) throw new UnauthorizedException('Invalid credentials');
    const ok = await bcrypt.compare(password, user.passwordHash);
    if (!ok) throw new UnauthorizedException('Invalid credentials');

    const payload = {
      sub: user.id,
      email: user.email,
      name: user.name,
      roles: user.roles.map((r) => r.role.name),
      driverProfileId: user.driverProfile?.id ?? null,
      branchId: user.branchId,
    };
    const accessToken = await this.jwt.signAsync(payload, {
      secret: process.env.JWT_ACCESS_SECRET,
      expiresIn: process.env.ACCESS_TOKEN_TTL ?? '15m',
    } as any);
    const refreshToken = await this.jwt.signAsync(payload, {
      secret: process.env.JWT_REFRESH_SECRET,
      expiresIn: process.env.REFRESH_TOKEN_TTL ?? '7d',
    } as any);
    await this.prisma.user.update({
      where: { id: user.id },
      data: { refreshTokenHash: await bcrypt.hash(refreshToken, 10) },
    });
    return { accessToken, refreshToken, user: payload, devPasswordHint: process.env.NODE_ENV === 'production' ? undefined : DEV_PASSWORD };
  }

  async refresh(refreshToken: string) {
    const payload = await this.jwt.verifyAsync<{ sub: string }>(refreshToken, {
      secret: process.env.JWT_REFRESH_SECRET,
    });
    const user = await this.prisma.user.findUnique({
      where: { id: payload.sub },
      include: { roles: { include: { role: true } }, driverProfile: true },
    });
    if (!user?.refreshTokenHash) throw new UnauthorizedException('Refresh token revoked');
    const ok = await bcrypt.compare(refreshToken, user.refreshTokenHash);
    if (!ok) throw new UnauthorizedException('Refresh token revoked');
    return this.login(user.email, DEV_PASSWORD);
  }

  async logout(userId: string) {
    await this.prisma.user.update({ where: { id: userId }, data: { refreshTokenHash: null } });
    return { ok: true };
  }
}
