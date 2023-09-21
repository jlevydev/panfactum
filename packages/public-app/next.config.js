/** @type {import('next').NextConfig} */
const nextConfig = {
    async rewrites() {
        return [
            // This is required for client-side routing in the spa to work
            // with react-router
            {
                source: '/app/:path*',
                destination: '/app',
            },
        ]
    },
}

module.exports = nextConfig
