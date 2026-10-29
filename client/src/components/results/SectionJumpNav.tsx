import { useEffect, useState } from "react";

interface SectionJumpNavProps {
  sections: { id: string; label: string }[];
}

export function SectionJumpNav({ sections }: SectionJumpNavProps) {
  const [activeId, setActiveId] = useState<string>(sections[0]?.id || "");

  useEffect(() => {
    const handleScroll = () => {
      const scrollPos = window.scrollY + 100;
      for (let i = sections.length - 1; i >= 0; i--) {
        const el = document.getElementById(sections[i].id);
        if (el && el.offsetTop <= scrollPos) {
          setActiveId(sections[i].id);
          break;
        }
      }
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, [sections]);

  const scrollToSection = (id: string) => {
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: "smooth" });
      el.focus({ preventScroll: true });
    }
  };

  return (
    <nav
      aria-label="On this page navigation"
      className="lg:hidden sticky top-16 z-20 bg-surface border-b border-border py-2 px-4 overflow-x-auto no-scrollbar"
    >
      <div className="flex items-center gap-1.5 whitespace-nowrap min-w-max">
        {sections.map((sec) => {
          const isActive = activeId === sec.id;
          return (
            <button
              key={sec.id}
              type="button"
              onClick={() => scrollToSection(sec.id)}
              className={`min-h-[36px] px-3 py-1.5 rounded-full text-xs font-semibold transition-colors cursor-pointer border ${
                isActive
                  ? "bg-primary text-primary-foreground border-primary shadow-xs"
                  : "bg-surface-raised text-muted-foreground border-border hover:text-foreground"
              } focus:outline-none focus-visible:ring-2 focus-visible:ring-ring`}
            >
              {sec.label}
            </button>
          );
        })}
      </div>
    </nav>
  );
}
