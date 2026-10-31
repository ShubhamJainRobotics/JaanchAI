import { Link } from "react-router-dom";
import { ArrowRight, ExternalLink } from "lucide-react";

export function Hero() {
  const scrollToSubmit = (e: React.MouseEvent) => {
    e.preventDefault();
    const target = document.getElementById("submit-offer");
    if (target) {
      target.scrollIntoView({ behavior: "smooth" });
    }
  };

  const portals = [
    {
      num: "01",
      name: "PM Internship Scheme (Ministry of Corporate Affairs)",
      url: "https://pminternship.mca.gov.in",
      displayUrl: "pminternship.mca.gov.in",
    },
    {
      num: "02",
      name: "National Career Service (Ministry of Labour)",
      url: "https://ncs.gov.in",
      displayUrl: "ncs.gov.in",
    },
    {
      num: "03",
      name: "National Scholarship Portal (NSP)",
      url: "https://scholarships.gov.in",
      displayUrl: "scholarships.gov.in",
    },
  ];

  return (
    <section className="pt-20 pb-12 sm:pt-24 sm:pb-16 lg:pt-24 lg:pb-20 border-b border-border">
      <div className="max-w-[1280px] mx-auto px-6 sm:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-12 items-stretch">
          {/* Left Column: Hero Copy */}
          <div className="lg:col-span-7 flex flex-col justify-between">
            <div>
              {/* Eyebrow */}
              <div className="inline-block text-xs font-semibold uppercase tracking-[0.08em] text-muted-subtle mb-3 select-none">
                INDEPENDENT VERIFICATION FOR STUDENTS
              </div>

              {/* Main Heading */}
              <h1 className="font-serif text-4xl sm:text-5xl lg:text-6xl font-normal leading-[1.15] text-foreground tracking-tight">
                Know it's real <br />
                <span className="text-terracotta">before you reply.</span>
              </h1>

              {/* Subtitle */}
              <p className="text-base sm:text-lg text-muted-foreground leading-relaxed mt-5 max-w-xl">
                A free tool that helps Indian students check job, internship and training offers before sharing money or documents.
              </p>

              {/* Action Buttons */}
              <div className="flex flex-wrap items-center gap-3.5 mt-8">
                <a
                  href="#submit-offer"
                  onClick={scrollToSubmit}
                  className="bg-primary text-primary-foreground hover:bg-neutral-800 rounded-lg px-6 py-3 font-medium text-sm sm:text-base transition-colors shadow-xs inline-flex items-center gap-2 cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-terracotta"
                >
                  <span>Check an offer</span>
                  <ArrowRight className="w-4 h-4" strokeWidth={2} aria-hidden="true" />
                </a>

                <Link
                  to="/results/local"
                  className="bg-surface border border-border-pill text-foreground hover:bg-neutral-50 rounded-lg px-6 py-3 font-medium text-sm sm:text-base transition-colors shadow-xs inline-flex items-center gap-2 focus:outline-none focus-visible:ring-2 focus-visible:ring-terracotta"
                >
                  <span>See a sample report</span>
                </Link>
              </div>
            </div>

            {/* 3-Column Mini Feature Strip */}
            <div className="border-t border-border pt-6 mt-10 grid grid-cols-1 sm:grid-cols-3 gap-6">
              <div className="space-y-1">
                <span className="font-serif text-lg font-normal text-terracotta block">
                  01
                </span>
                <span className="text-sm font-semibold text-foreground block">
                  Don't pay to start
                </span>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  Real internships never ask for fees, deposits, or kit charges.
                </p>
              </div>

              <div className="space-y-1">
                <span className="font-serif text-lg font-normal text-terracotta block">
                  02
                </span>
                <span className="text-sm font-semibold text-foreground block">
                  Check the sender
                </span>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  Verify free email IDs, lookalike links, and official corporate CINs.
                </p>
              </div>

              <div className="space-y-1">
                <span className="font-serif text-lg font-normal text-terracotta block">
                  03
                </span>
                <span className="text-sm font-semibold text-foreground block">
                  Verify, then reply
                </span>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  Follow 8 verified student safety rules before accepting terms.
                </p>
              </div>
            </div>
          </div>

          {/* Right Column: Official Portals Card */}
          <div className="lg:col-span-5 flex flex-col">
            <div className="bg-surface rounded-2xl border border-border p-6 sm:p-8 flex flex-col justify-between h-full shadow-xs">
              <div className="space-y-6">
                <div>
                  <span className="text-xs font-semibold uppercase tracking-[0.08em] text-muted-subtle block mb-1">
                    VERIFIED CHANNELS
                  </span>
                  <h2 className="font-serif text-2xl font-normal text-foreground leading-snug">
                    Official portals are always 100% free.
                  </h2>
                </div>

                <div className="space-y-4 divide-y divide-border">
                  {portals.map((portal) => (
                    <div key={portal.num} className="pt-4 first:pt-0">
                      <div className="flex items-start gap-3">
                        <span className="font-serif text-base text-terracotta font-medium shrink-0 mt-0.5">
                          {portal.num}
                        </span>
                        <div className="space-y-1 flex-1">
                          <h3 className="text-sm font-semibold text-foreground leading-snug">
                            {portal.name}
                          </h3>
                          <a
                            href={portal.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-xs text-muted-foreground hover:text-terracotta inline-flex items-center gap-1 underline underline-offset-2 transition-colors font-mono"
                          >
                            <span>{portal.displayUrl}</span>
                            <ExternalLink className="w-3 h-3" aria-hidden="true" />
                          </a>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="border-t border-border pt-4 mt-6">
                <p className="text-xs text-muted-subtle leading-relaxed flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-success shrink-0" aria-hidden="true" />
                  <span>Reference: Official Government Portals • Zero Application Fees</span>
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
