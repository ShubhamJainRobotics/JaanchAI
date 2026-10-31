export function FeatureMatrix() {
  const items = [
    {
      eyebrow: "OFFER TYPES COVERED",
      title: "Comprehensive Coverage",
      description: "Placements, internships, freelance",
    },
    {
      eyebrow: "REGIONAL LANGUAGES",
      title: "English & 12 Indian Scripts",
      description: "English, Hindi, Tamil, Telugu, Marathi, Bengali, Kannada, etc.",
    },
    {
      eyebrow: "OPEN ACCESS",
      title: "100% Free & Independent",
      description: "No fees, zero data tracking",
    },
    {
      eyebrow: "OFFICIAL REPORTING",
      title: "National Helpline 1930",
      description: "Direct referral to Cyber Crime Portal",
    },
  ];

  return (
    <section id="coverage" className="py-8 sm:py-12 border-b border-border">
      <div className="max-w-[1280px] mx-auto px-6 sm:px-8">
        <div className="bg-surface rounded-2xl border border-border grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 divide-y md:divide-y-0 md:divide-x divide-border shadow-xs overflow-hidden">
          {items.map((item, idx) => (
            <div
              key={item.eyebrow}
              className={`p-6 sm:p-7 flex flex-col justify-between space-y-3 ${
                idx === 2 ? "md:border-t-0" : ""
              }`}
            >
              <span className="text-xs font-semibold uppercase tracking-[0.08em] text-muted-subtle block">
                {item.eyebrow}
              </span>
              <div className="space-y-1">
                <h3 className="text-base sm:text-lg font-bold text-foreground leading-snug">
                  {item.title}
                </h3>
                <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
                  {item.description}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

