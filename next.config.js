// Fixa o fuso do servidor (Vercel roda em UTC por padrão), evitando que
// datas calculadas via new Date()/toLocaleDateString() no SSR divirjam do
// navegador do cliente (Brasil, UTC-3) e causem erro de hydration do React.
process.env.TZ = "America/Sao_Paulo";

/** @type {import('next').NextConfig} */
const nextConfig = {
  outputFileTracingIncludes: {
    "/api/**/*": ["./node_modules/.prisma/client/**/*"],
  },
};

module.exports = nextConfig;
