import type { NextConfig } from "next";
import CopyWebpackPlugin from "copy-webpack-plugin";

const nextConfig: NextConfig = {
  outputFileTracingRoot: process.cwd(),
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'medianewbuild.com',
        pathname: '/**',
      },
    ],
  },
  webpack: (config, { webpack }) => {
    config.resolve.alias = {
      ...(config.resolve.alias || {}),
      "@zip.js/zip.js/lib/zip-no-worker.js": "@zip.js/zip.js/lib/zip.js",
    };

    config.plugins.push(
      new CopyWebpackPlugin({
        patterns: [
          { from: "node_modules/cesium/Build/Cesium/Workers", to: "static/cesium/Workers" },
          { from: "node_modules/cesium/Build/Cesium/ThirdParty", to: "static/cesium/ThirdParty" },
          { from: "node_modules/cesium/Build/Cesium/Assets", to: "static/cesium/Assets" },
          { from: "node_modules/cesium/Build/Cesium/Widgets", to: "static/cesium/Widgets" },
        ],
      }),
      new webpack.DefinePlugin({
        CESIUM_BASE_URL: JSON.stringify("/_next/static/cesium"),
      }),
    );

    return config;
  },
};

export default nextConfig;
