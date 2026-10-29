import { HeroAnalyzer } from "./HeroAnalyzer";
import { SampleReportPreview } from "./SampleReportPreview";

export function Hero() {
  return (
    <section className="pt-8 pb-12 sm:pt-12 sm:pb-16 lg:pt-16 lg:pb-20">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-10 items-start">
          {/* Left Column: Headline, sub-copy, and Inline Hero Analyzer */}
          <div className="lg:col-span-7 space-y-6 text-left">
            <div>
              <h1 className="font-extrabold text-foreground tracking-tight [text-wrap:balance] text-[clamp(1.875rem,4vw,3.25rem)] leading-[1.15]">
                Spot Warning Signs{" "}
                <span className="text-primary inline">
                  Before You Pay or Share Private&nbsp;Data
                </span>
              </h1>

              <p className="mt-4 text-sm sm:text-base text-muted-foreground leading-relaxed max-w-2xl">
                Students encounter hundreds of internship offers, scholarships, and freelance messages online. 
                Jaanch helps you understand <strong>why</strong> something may be risky and <strong>what you should independently verify</strong> before taking action.
              </p>
            </div>

            {/* Inline Analyzer Card (§4.1) */}
            <HeroAnalyzer />
          </div>

          {/* Right Column: Sample Report Preview (§4.2) */}
          <div className="lg:col-span-5 w-full">
            <SampleReportPreview />
          </div>
        </div>
      </div>
    </section>
  );
}
