import { CanActivate, ExecutionContext, Injectable, SetMetadata, UnauthorizedException, ForbiddenException, createParamDecorator } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { JwtService } from '@nestjs/jwt';
import { RoleName } from '@prisma/client';

export const IS_PUBLIC_KEY = 'isPublic';
export const Public = () => SetMetadata(IS_PUBLIC_KEY, true);
export const ROLES_KEY = 'roles';
export const Roles = (...roles: RoleName[]) => SetMetadata(ROLES_KEY, roles);

export interface RequestUser {
  sub: string;
  email: string;
  name: string;
  roles: RoleName[];
  driverProfileId?: string | null;
  branchId?: string | null;
}

export const CurrentUser = createParamDecorator((_data: unknown, ctx: ExecutionContext): RequestUser => {
  return ctx.switchToHttp().getRequest().user;
});

@Injectable()
export class JwtAuthGuard implements CanActivate {
  constructor(
    private readonly reflector: Reflector,
    private readonly jwt: JwtService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);
    if (isPublic) return true;

    const request = context.switchToHttp().getRequest();
    const auth = request.headers.authorization as string | undefined;
    const token = auth?.startsWith('Bearer ') ? auth.slice(7) : undefined;
    if (!token) throw new UnauthorizedException('Missing bearer token');

    try {
      request.user = await this.jwt.verifyAsync<RequestUser>(token, {
        secret: process.env.JWT_ACCESS_SECRET,
      });
    } catch {
      throw new UnauthorizedException('Invalid or expired token');
    }

    const requiredRoles = this.reflector.getAllAndOverride<RoleName[]>(ROLES_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);
    if (!requiredRoles?.length) return true;
    if (requiredRoles.some((role) => request.user.roles.includes(role))) return true;
    throw new ForbiddenException('Insufficient role');
  }
}
