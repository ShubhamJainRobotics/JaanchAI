import { OFFICIAL_PORTALS } from "../config/officialPortals.js";
import { ChecklistItem, OpportunityDomain, RiskLevel } from "../schemas/index.js";
import { RuleHit } from "../rules/types.js";

export function buildVerificationChecklist(
  domain: OpportunityDomain,
  riskLevel: RiskLevel,
  hits: RuleHit[],
  hasLinksOrEmail: boolean
): ChecklistItem[] {
  const items: ChecklistItem[] = [];
  let position = 0;

  // 1. Find official site independently
  items.push({
    position: position++,
    label:
      "Find the organization's official website yourself (search by name — do not use links from the message).",
    portalKey: null,
    completed: false,
  });

  // 2. Contact recruiter via independent official channel
  items.push({
    position: position++,
    label:
      "Contact the recruiter/organizer through an official channel you found independently.",
    portalKey: null,
    completed: false,
  });

  // 3. Domain-specific portal step(s)
  const relevantPortals = OFFICIAL_PORTALS.filter((p) =>
    (p.domains as readonly string[]).includes(domain)
  );

  for (const portal of relevantPortals) {
    if (portal.key === "cybercrime") {
      // Handled in report step if high concern
      continue;
    }
    items.push({
      position: position++,
      label: `Verify on ${portal.name} (${portal.use})`,
      portalKey: portal.key,
      completed: false,
    });
  }

  // 4. Inspect links/email if present
  if (hasLinksOrEmail || hits.some((h) => h.category === "link" || h.ruleId === "CHN-001")) {
    items.push({
      position: position++,
      label: "Inspect the sender's email/link domain with Jaanch's Link Check.",
      portalKey: null,
      completed: false,
    });
  }

  // 5. Payment or data request warning
  const hasPaymentOrData = hits.some(
    (h) => h.category === "payment" || h.category === "data_request"
  );
  if (hasPaymentOrData || riskLevel === "HIGH_CONCERN") {
    items.push({
      position: position++,
      label:
        "Do not pay, and do not share OTP, bank login, UPI PIN, or ID photos before verifying.",
      portalKey: null,
      completed: false,
    });
  }

  // 6. Recruiter challenge email
  items.push({
    position: position++,
    label:
      "Send the recruiter challenge email and see whether a genuine response arrives.",
    portalKey: null,
    completed: false,
  });

  // 7. Ask placement cell or trusted mentor
  items.push({
    position: position++,
    label: "Ask your college placement cell or a trusted senior.",
    portalKey: null,
    completed: false,
  });

  // 8. For HIGH_CONCERN: Report guidance
  if (riskLevel === "HIGH_CONCERN") {
    items.push({
      position: position++,
      label:
        "Keep screenshots and payment details, and report at cybercrime.gov.in or call 1930 if money was lost or details were shared.",
      portalKey: "cybercrime",
      completed: false,
    });
  }

  return items;
}
