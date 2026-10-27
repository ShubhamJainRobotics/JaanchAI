import { getDomain } from "tldts";
import { env } from "../config/env.js";

export interface RdapResult {
  registrableDomain: string | null;
  rdapStatus: "not_run" | "ok" | "unavailable" | "not_found" | "timeout";
  domainRegisteredAt: string | null;
}

export async function lookupRdap(hostname: string): Promise<RdapResult> {
  const registrableDomain = getDomain(hostname);
  if (!registrableDomain) {
    return {
      registrableDomain: null,
      rdapStatus: "unavailable",
      domainRegisteredAt: null,
    };
  }

  const targetUrl = `${env.RDAP_BASE_URL.replace(/\/$/, "")}/${encodeURIComponent(registrableDomain)}`;
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), env.RDAP_TIMEOUT_MS);

  try {
    const res = await fetch(targetUrl, {
      method: "GET",
      headers: {
        Accept: "application/rdap+json, application/json",
        "User-Agent": "Jaanch-TrustSafety-Agent/1.0",
      },
      signal: controller.signal,
      redirect: "follow",
    });

    if (res.status === 404) {
      return {
        registrableDomain,
        rdapStatus: "not_found",
        domainRegisteredAt: null,
      };
    }

    if (!res.ok) {
      return {
        registrableDomain,
        rdapStatus: "unavailable",
        domainRegisteredAt: null,
      };
    }

    // Limit response size to ~200 KB
    const text = await res.text();
    if (text.length > 200 * 1024) {
      return {
        registrableDomain,
        rdapStatus: "unavailable",
        domainRegisteredAt: null,
      };
    }

    const data = JSON.parse(text);
    let domainRegisteredAt: string | null = null;

    if (Array.isArray(data.events)) {
      for (const ev of data.events) {
        if (ev.eventAction === "registration" && ev.eventDate) {
          const dateObj = new Date(ev.eventDate);
          if (!isNaN(dateObj.getTime())) {
            domainRegisteredAt = dateObj.toISOString();
            break;
          }
        }
      }
    }

    return {
      registrableDomain,
      rdapStatus: "ok",
      domainRegisteredAt,
    };
  } catch (err: any) {
    const isTimeout = err.name === "AbortError" || controller.signal.aborted;
    return {
      registrableDomain,
      rdapStatus: isTimeout ? "timeout" : "unavailable",
      domainRegisteredAt: null,
    };
  } finally {
    clearTimeout(timer);
  }
}
