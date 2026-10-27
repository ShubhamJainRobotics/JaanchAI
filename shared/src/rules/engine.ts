import { ALL_RULES } from "./catalog.js";
import { RuleContext, RuleHit } from "./types.js";

export function runRules(ctx: RuleContext): RuleHit[] {
  const hits: RuleHit[] = [];
  for (const rule of ALL_RULES) {
    try {
      const result = rule(ctx);
      if (result && result.length > 0) {
        hits.push(...result);
      }
    } catch (err) {
      // Rule failure must not crash the engine
      console.error(`Rule execution error:`, err);
    }
  }
  return hits;
}
