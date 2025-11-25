/** @type {import('next').NextConfig} */
const nextConfig = {
  // experimental.appDir больше не нужен в Next.js 14
  output: 'standalone', // Для Docker деплоя
}

module.exports = nextConfig



