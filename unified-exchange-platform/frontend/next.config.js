/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'export',
  images: {
    unoptimized: true,
  },
  // GitHub Pages genellikle bir alt dizinde çalışır (örn: /repo-adi)
  // Eğer custom domain yoksa basePath gerekebilir, şimdilik boş bırakıyoruz.
}

module.exports = nextConfig
