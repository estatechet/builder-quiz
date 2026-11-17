/** @type {import('next').NextConfig} */
const nextConfig = {
  // 연말 만찬 초대장: /party → 정적 페이지
  async rewrites() {
    return [{ source: "/party", destination: "/party/index.html" }];
  },
};
export default nextConfig;
