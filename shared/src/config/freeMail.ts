export const FREE_MAIL_DOMAINS = new Set<string>([
  "gmail.com",
  "googlemail.com",
  "yahoo.com",
  "yahoo.in",
  "yahoo.co.in",
  "outlook.com",
  "hotmail.com",
  "live.com",
  "proton.me",
  "protonmail.com",
  "icloud.com",
  "aol.com",
  "rediffmail.com",
  "zoho.com",
  "mail.com",
  "gmx.com",
  "yandex.com",
]);

export function isFreeMailDomain(domain: string): boolean {
  if (!domain) return false;
  const clean = domain.trim().toLowerCase();
  return FREE_MAIL_DOMAINS.has(clean);
}
