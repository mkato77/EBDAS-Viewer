/** @type {import('next').NextConfig} */
module.exports = {
  reactStrictMode: true,
  output: `export`,
  webpack: (config, { isServer, webpack }) => {
    if (!isServer) {
      config.resolve.fallback.fs = false;
    }
    config.module.rules.push({
      test: /\.wasm$/,
      type: 'asset/resource',
    });
    return config;
  },
};
