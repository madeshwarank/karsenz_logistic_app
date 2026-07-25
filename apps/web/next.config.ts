import type { NextConfig } from 'next';
import path from 'node:path';

const nextConfig: NextConfig = {
  transpilePackages: ['@karsenz/ui', '@karsenz/shared-types', '@karsenz/validation'],
  outputFileTracingRoot: path.join(__dirname, '../..'),
};

export default nextConfig;
