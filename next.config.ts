import type { NextConfig } from "next";
import os from "os";

/**
 * Dynamically collects all local network IPv4 addresses.
 * This ensures that ANY device on the local network (phone, tablet, etc.)
 * can load Next.js dev chunks without the "chunk FAILED to load" error.
 *
 * Problem solved: Next.js 16+ blocks cross-origin requests to /_next/* by default.
 * See: MOBILE_DEV.md for troubleshooting guide.
 */
function getLocalNetworkOrigins(): string[] {
  const origins: string[] = [];
  const interfaces = os.networkInterfaces();

  for (const iface of Object.values(interfaces)) {
    if (!iface) continue;
    for (const config of iface) {
      // Only IPv4, non-loopback (skip 127.0.0.1)
      if (config.family === "IPv4" && !config.internal) {
        origins.push(config.address);
        console.log(`[next.config] Allowing dev origin: ${config.address}`);
      }
    }
  }

  return origins;
}

const nextConfig: NextConfig = {
  // Allow all local network devices to load dev resources (JS chunks, HMR).
  // IPs are detected dynamically at server start, so they always stay correct
  // even after a router reboot or DHCP reassignment.
  allowedDevOrigins: getLocalNetworkOrigins(),
};

export default nextConfig;
