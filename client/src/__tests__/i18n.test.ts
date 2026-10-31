import { describe, it, expect } from "vitest";
import { translations, Language, Translations } from "../i18n/translations";

describe("i18n Multi-Language System", () => {
  const supportedLanguages: Language[] = ["en", "hi", "kn"];

  it("supports 'en', 'hi', and 'kn' languages", () => {
    supportedLanguages.forEach((lang) => {
      expect(translations[lang]).toBeDefined();
    });
  });

  it("has non-empty string translations for all keys across en, hi, kn", () => {
    const keysToCheck: (keyof Translations)[] = [
      "nav",
      "hero",
      "matrix",
      "submission",
      "audit",
      "guidelines",
      "footer",
    ];

    supportedLanguages.forEach((lang) => {
      const dict = translations[lang];

      keysToCheck.forEach((sectionKey) => {
        expect(dict[sectionKey]).toBeDefined();
        const section = dict[sectionKey] as Record<string, unknown>;

        Object.entries(section).forEach(([subKey, value]) => {
          if (typeof value === "string") {
            expect(value.trim().length, `Empty translation for ${lang}.${sectionKey}.${subKey}`).toBeGreaterThan(0);
          } else if (typeof value === "object" && value !== null) {
            // Nested object like scenarios
            Object.entries(value).forEach(([nestedKey, nestedValue]) => {
              expect(
                typeof nestedValue === "string" && nestedValue.trim().length > 0,
                `Empty translation for ${lang}.${sectionKey}.${subKey}.${nestedKey}`
              ).toBe(true);
            });
          }
        });
      });
    });
  });

  it("verifies Hindi translations contain Devanagari script characters", () => {
    const hi = translations.hi;
    expect(hi.nav.brand_sub).toBe("ऑफ़र सत्यापन");
    expect(hi.hero.title_p1).toBe("सच्चाई जानें,");
    expect(hi.footer.select_lang).toBe("भाषा चुनें:");
  });

  it("verifies Kannada translations contain Kannada script characters", () => {
    const kn = translations.kn;
    expect(kn.nav.brand_sub).toBe("ಆಫರ್ ಪರಿಶೀಲನೆ");
    expect(kn.hero.title_p1).toBe("ನಿಜವೆಂದು ತಿಳಿಯಿರಿ,");
    expect(kn.footer.select_lang).toBe("ಭಾಷೆಯನ್ನು ಆಯ್ಕೆಮಾಡಿ:");
  });
});

