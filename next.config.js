/** @type {import('next').NextConfig} */
const nextConfig = {
    experimental: {
        serverComponentsExternalPackages: ['jimp', 'tough-cookie-filestore2']
    }
};

module.exports = nextConfig;
