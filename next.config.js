/** @type {import('next').NextConfig} */
const nextConfig = {
    experimental: {
        serverComponentsExternalPackages: ['jimp', 'tough-cookie-filestore2'],
        outputFileTracingIncludes: {
            '/api/generate-comic': [
                './PANELz/**/*',
                './Backgrounds/**/*',
                './fonts/**/*'
            ]
        }
    }
};

module.exports = nextConfig;
