/** @type {import('next').NextConfig} */
const nextConfig = {
  outputFileTracingIncludes: {
    "/api/**/*": ["./node_modules/.prisma/client/**/*"],
  },
};

module.exports = nextConfig;
