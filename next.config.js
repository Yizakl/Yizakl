/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // 生产环境配置
  productionBrowserSourceMaps: false,
  // 可选：CDN前缀配置
  // assetPrefix: 'https://cdn.yourdomain.com',
  // 图片优化配置
  images: {
    domains: [],
    formats: ['image/avif', 'image/webp'],
  },
  // 压缩配置
  compress: true,
  // 输出配置
  output: 'standalone',
}

module.exports = nextConfig 