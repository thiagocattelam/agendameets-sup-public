/** @type {import('next').NextConfig} */
const nextConfig = {
  outputFileTracingIncludes: {
    "/api/**/*": ["./lib/generated/prisma/**/*"],
  },
};

module.exports = nextConfig;
