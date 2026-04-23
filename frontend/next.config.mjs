// next.config.mjs
/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "i.ytimg.com" },
      { protocol: "https", hostname: "yt3.ggpht.com" },
      { protocol: "https", hostname: "stellive.me" },
      { protocol: "https", hostname: "dcjnmis8jxmbl.cloudfront.net" },
    ],
  },
};

export default nextConfig;
