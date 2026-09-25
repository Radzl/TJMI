import type { NextConfig } from 'next';
import createNextIntlPlugin from 'next-intl/plugin';

const nextConfig: NextConfig = {
  // Quita el distintivo flotante de Next en desarrollo: tapaba la esquina y
  // se confundía con un elemento de la propia web.
  devIndicators: false,
};

const withNextIntl = createNextIntlPlugin();

export default withNextIntl(nextConfig);
