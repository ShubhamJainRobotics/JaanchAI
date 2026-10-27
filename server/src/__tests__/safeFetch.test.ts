import { describe, it, expect, vi } from "vitest";
import { safeFetch } from "../lib/safeFetch.js";

describe("SSRF and safeFetch Controls", () => {
  it("rejects non-https URLs", async () => {
    await expect(
      safeFetch("http://example.com/listing", {
        allowedHosts: ["example.com"],
      })
    ).rejects.toThrow(/Only HTTPS protocol is allowed/);
  });

  it("rejects URLs with credentials", async () => {
    await expect(
      safeFetch("https://user:pass@example.com/listing", {
        allowedHosts: ["example.com"],
      })
    ).rejects.toThrow(/Embedded credentials in URL are forbidden/);
  });

  it("rejects hosts not in allowlist", async () => {
    await expect(
      safeFetch("https://evil-unauthorized.com/listing", {
        allowedHosts: ["example.com", "tcs.com"],
      })
    ).rejects.toThrow(/is not in the approved registry allowlist/);
  });

  it("rejects loopback and private IP addresses", async () => {
    // 127.0.0.1 loopback
    await expect(
      safeFetch("https://127.0.0.1/admin", {
        allowedHosts: ["127.0.0.1"],
      })
    ).rejects.toThrow(/forbidden \(private, loopback, or non-routable\)/);

    // Localhost
    await expect(
      safeFetch("https://localhost/admin", {
        allowedHosts: ["localhost"],
      })
    ).rejects.toThrow(/forbidden \(private, loopback, or non-routable\)/);
  });

  it("rejects private IPv4 subnets (10.0.0.0/8, 192.168.0.0/16, 172.16.0.0/12)", async () => {
    await expect(
      safeFetch("https://10.0.0.1/secret", {
        allowedHosts: ["10.0.0.1"],
      })
    ).rejects.toThrow(/forbidden \(private, loopback, or non-routable\)/);

    await expect(
      safeFetch("https://192.168.1.1/secret", {
        allowedHosts: ["192.168.1.1"],
      })
    ).rejects.toThrow(/forbidden \(private, loopback, or non-routable\)/);
  });

  it("never makes an outbound request to a suspect or user-supplied host", async () => {
    const suspectUrl = "https://phishing-portal-careers.xyz/login";
    // Listing fetch only allows registry-allowlisted hosts
    await expect(
      safeFetch(suspectUrl, {
        allowedHosts: ["tcs.com", "infosys.com", "google.com"],
      })
    ).rejects.toThrow(/is not in the approved registry allowlist/);
  });
});
