import dns from "node:dns/promises";
import net from "node:net";
import { Agent, fetch as undiciFetch } from "undici";
import { logger } from "./logger.js";

export interface SafeFetchOptions {
  timeoutMs?: number;
  maxBytes?: number;
  allowedHosts?: string[];
  allowGovSubdomains?: boolean;
  allowedContentTypes?: string[];
  maxRedirects?: number;
}

export interface SafeFetchResult {
  url: string;
  status: number;
  headers: Headers;
  text: string;
}

/**
 * Check if an IP address belongs to loopback, private, link-local, CGNAT, or multicast ranges.
 */
export function isForbiddenIp(ip: string): boolean {
  if (!ip) return true;

  // Handle IPv4-mapped IPv6 (::ffff:127.0.0.1)
  if (ip.startsWith("::ffff:")) {
    const ipv4Part = ip.slice(7);
    if (net.isIPv4(ipv4Part)) {
      return isForbiddenIp(ipv4Part);
    }
  }

  const isV4 = net.isIPv4(ip);
  const isV6 = net.isIPv6(ip);

  if (!isV4 && !isV6) {
    return true; // Malformed IP
  }

  if (isV4) {
    const parts = ip.split(".").map((p) => parseInt(p, 10));
    if (parts.length !== 4 || parts.some((p) => isNaN(p) || p < 0 || p > 255)) {
      return true;
    }

    const [b0, b1] = parts;

    // 0.0.0.0/8 (Broadcast/unspecified)
    if (b0 === 0) return true;

    // 127.0.0.0/8 (Loopback)
    if (b0 === 127) return true;

    // 10.0.0.0/8 (Private)
    if (b0 === 10) return true;

    // 172.16.0.0/12 (Private: 172.16.0.0 - 172.31.255.255)
    if (b0 === 172 && b1 >= 16 && b1 <= 31) return true;

    // 192.168.0.0/16 (Private)
    if (b0 === 192 && b1 === 168) return true;

    // 169.254.0.0/16 (Link-local)
    if (b0 === 169 && b1 === 254) return true;

    // 100.64.0.0/10 (Carrier-Grade NAT: 100.64.0.0 - 100.127.255.255)
    if (b0 === 100 && b1 >= 64 && b1 <= 127) return true;

    // 224.0.0.0/4 (Multicast: 224.0.0.0 - 239.255.255.255)
    if (b0 >= 224 && b0 <= 239) return true;

    // 240.0.0.0/4 (Reserved) & 255.255.255.255 (Broadcast)
    if (b0 >= 240) return true;

    return false;
  }

  // IPv6 checks
  const lower = ip.toLowerCase();

  // ::1 (Loopback) & :: (Unspecified)
  if (lower === "::1" || lower === "::") return true;

  // fe80::/10 (Link-local)
  if (lower.startsWith("fe8") || lower.startsWith("fe9") || lower.startsWith("fea") || lower.startsWith("feb")) {
    return true;
  }

  // fc00::/7 (Unique local address: fc00::/8 and fd00::/8)
  if (lower.startsWith("fc") || lower.startsWith("fd")) {
    return true;
  }

  // ff00::/8 (Multicast)
  if (lower.startsWith("ff")) {
    return true;
  }

  return false;
}

/**
 * Validates that host is allowed based on explicit allowlist or gov domains.
 */
export function isHostAllowed(
  hostname: string,
  allowedHosts?: string[],
  allowGovSubdomains?: boolean
): boolean {
  const host = hostname.toLowerCase().trim();

  // If allowGovSubdomains is true, allow any .gov.in or .nic.in host
  if (allowGovSubdomains && (host.endsWith(".gov.in") || host.endsWith(".nic.in"))) {
    return true;
  }

  if (!allowedHosts || allowedHosts.length === 0) {
    return true;
  }

  for (const allowed of allowedHosts) {
    const cleanAllowed = allowed.toLowerCase().trim();
    if (host === cleanAllowed || host.endsWith("." + cleanAllowed)) {
      return true;
    }
  }

  return false;
}

/**
 * SSRF-Safe HTTP Fetch utility.
 */
export async function safeFetch(
  targetUrl: string,
  options?: SafeFetchOptions
): Promise<SafeFetchResult> {
  const timeoutMs = options?.timeoutMs ?? 5000;
  const maxBytes = options?.maxBytes ?? 1000000; // 1 MB default cap
  const maxRedirects = options?.maxRedirects ?? 3;
  const allowedContentTypes = options?.allowedContentTypes ?? [
    "text/html",
    "text/plain",
    "application/json",
  ];

  let currentUrl = targetUrl;
  let redirectsCount = 0;

  while (redirectsCount <= maxRedirects) {
    let parsed: URL;
    try {
      parsed = new URL(currentUrl);
    } catch {
      throw new Error(`Invalid URL format: ${currentUrl}`);
    }

    // 1. Mandatory HTTPS enforcement
    if (parsed.protocol !== "https:") {
      throw new Error(`SSRF Rejected: Only HTTPS protocol is allowed. Got: ${parsed.protocol}`);
    }

    // 2. Reject credentials in URL
    if (parsed.username || parsed.password) {
      throw new Error("SSRF Rejected: Embedded credentials in URL are forbidden.");
    }

    const hostname = parsed.hostname.toLowerCase();

    // 3. Allowlist enforcement
    if (
      options?.allowedHosts &&
      !isHostAllowed(hostname, options.allowedHosts, options.allowGovSubdomains)
    ) {
      throw new Error(
        `SSRF Rejected: Host '${hostname}' is not in the approved registry allowlist.`
      );
    }

    // 4. DNS Resolution & IP Range Verification
    let resolvedAddresses: Array<{ address: string; family: number }>;
    try {
      resolvedAddresses = await dns.lookup(hostname, { all: true });
    } catch (dnsErr: any) {
      throw new Error(`DNS resolution failed for '${hostname}': ${dnsErr.message}`);
    }

    if (!resolvedAddresses || resolvedAddresses.length === 0) {
      throw new Error(`No DNS records found for host '${hostname}'.`);
    }

    // Reject if ANY resolved IP is private/loopback/link-local
    for (const record of resolvedAddresses) {
      if (isForbiddenIp(record.address)) {
        logger.warn(
          { host: hostname, ip: record.address },
          "SSRF attempt blocked: resolved address is forbidden"
        );
        throw new Error(
          `SSRF Rejected: Resolved IP ${record.address} is forbidden (private, loopback, or non-routable).`
        );
      }
    }

    // 5. Pin the first resolved IP to prevent DNS rebinding
    const pinned = resolvedAddresses[0];

    const agent = new Agent({
      connect: {
        lookup: (_h, _opts, callback) => {
          callback(null, pinned.address, pinned.family);
        },
      },
    });

    const controller = new AbortController();
    const timeoutTimer = setTimeout(() => controller.abort(), timeoutMs);

    try {
      const response = await undiciFetch(currentUrl, {
        method: "GET",
        headers: {
          "User-Agent": "Jaanch-Verification-Agent/2.0 (+https://jaanch.org)",
          Accept: allowedContentTypes.join(", "),
        },
        redirect: "manual",
        signal: controller.signal,
        dispatcher: agent,
      });

      // Handle Redirects manually to re-verify every hop
      if (
        response.status === 301 ||
        response.status === 302 ||
        response.status === 303 ||
        response.status === 307 ||
        response.status === 308
      ) {
        redirectsCount++;
        const location = response.headers.get("location");
        if (!location) {
          throw new Error("Redirect response missing Location header.");
        }
        currentUrl = new URL(location, currentUrl).href;
        continue;
      }

      if (!response.ok) {
        throw new Error(`HTTP Error ${response.status}: ${response.statusText}`);
      }

      // Check Content-Type
      const contentType = response.headers.get("content-type")?.toLowerCase() || "";
      const isAllowedType = allowedContentTypes.some((ct) =>
        contentType.includes(ct.toLowerCase())
      );
      if (!isAllowedType) {
        throw new Error(
          `Disallowed Content-Type '${contentType}'. Expected one of: ${allowedContentTypes.join(", ")}`
        );
      }

      // Check Content-Length if present
      const contentLengthHeader = response.headers.get("content-length");
      if (contentLengthHeader) {
        const size = parseInt(contentLengthHeader, 10);
        if (!isNaN(size) && size > maxBytes) {
          throw new Error(
            `Response size (${size} bytes) exceeds the maximum allowed limit of ${maxBytes} bytes.`
          );
        }
      }

      // Read body with streaming byte cap
      if (!response.body) {
        return {
          url: currentUrl,
          status: response.status,
          headers: response.headers,
          text: "",
        };
      }

      const reader = response.body.getReader();
      const chunks: Uint8Array[] = [];
      let totalBytes = 0;

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        if (value) {
          totalBytes += value.length;
          if (totalBytes > maxBytes) {
            controller.abort();
            throw new Error(`Response body exceeded maximum limit of ${maxBytes} bytes.`);
          }
          chunks.push(value);
        }
      }

      const totalBuffer = new Uint8Array(totalBytes);
      let offset = 0;
      for (const chunk of chunks) {
        totalBuffer.set(chunk, offset);
        offset += chunk.length;
      }

      const text = new TextDecoder("utf-8").decode(totalBuffer);

      return {
        url: currentUrl,
        status: response.status,
        headers: response.headers,
        text,
      };
    } finally {
      clearTimeout(timeoutTimer);
    }
  }

  throw new Error(`Exceeded maximum allowed redirects (${maxRedirects}).`);
}
