/** @type {import('next').NextConfig} */
const nextConfig = {
  transpilePackages: ["@qschool/shared"],
  // starts the WhatsApp reminder scheduler when the server boots (src/instrumentation.ts)
  experimental: { instrumentationHook: true },
  // public admission form: /admission and /admission/ -> public/admission/index.html
  async rewrites() {
    return [
      { source: "/admission", destination: "/admission/index.html" },
      { source: "/admission/", destination: "/admission/index.html" },
    ];
  },
  async headers() {
    return [
      {
        source: "/api/:path*",
        headers: [
          { key: "Access-Control-Allow-Origin", value: "*" },
          { key: "Access-Control-Allow-Methods", value: "GET,OPTIONS,PATCH,DELETE,POST,PUT" },
          { key: "Access-Control-Allow-Headers", value: "X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version, Authorization, Origin" },
        ],
      },
    ];
  },
};

export default nextConfig;
