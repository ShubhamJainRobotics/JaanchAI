import { FileText, Image as ImageIcon, FileCheck } from "lucide-react";

export type InputMode = "text" | "screenshot" | "pdf";

interface InputTabsProps {
  activeTab: InputMode;
  onTabChange: (tab: InputMode) => void;
}

export function InputTabs({ activeTab, onTabChange }: InputTabsProps) {
  const tabs = [
    { id: "text", label: "Paste Text", icon: FileText },
    { id: "screenshot", label: "Screenshot OCR", icon: ImageIcon },
    { id: "pdf", label: "Offer Letter PDF", icon: FileCheck },
  ] as const;

  const handleKeyDown = (e: React.KeyboardEvent, index: number) => {
    let nextIndex = -1;
    if (e.key === "ArrowRight") {
      nextIndex = (index + 1) % tabs.length;
    } else if (e.key === "ArrowLeft") {
      nextIndex = (index - 1 + tabs.length) % tabs.length;
    } else if (e.key === "Home") {
      nextIndex = 0;
    } else if (e.key === "End") {
      nextIndex = tabs.length - 1;
    }

    if (nextIndex >= 0) {
      e.preventDefault();
      onTabChange(tabs[nextIndex].id);
      const nextBtn = document.getElementById(`tab-${tabs[nextIndex].id}`);
      nextBtn?.focus();
    }
  };

  return (
    <div
      className="flex border-b border-border mb-6 gap-1"
      role="tablist"
      aria-label="Input method selection"
    >
      {tabs.map((tab, idx) => {
        const IconComponent = tab.icon;
        const isActive = activeTab === tab.id;
        return (
          <button
            key={tab.id}
            id={`tab-${tab.id}`}
            role="tab"
            aria-selected={isActive}
            aria-controls={`tabpanel-${tab.id}`}
            tabIndex={isActive ? 0 : -1}
            onClick={() => onTabChange(tab.id)}
            onKeyDown={(e) => handleKeyDown(e, idx)}
            className={`min-h-[44px] flex items-center justify-center gap-2 py-2.5 px-4 sm:px-6 text-sm font-semibold border-b-2 transition-colors rounded-t-md cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-ring ${
              isActive
                ? "border-primary text-primary bg-primary/10"
                : "border-transparent text-muted-foreground hover:text-foreground hover:border-border"
            }`}
          >
            <IconComponent className="w-4 h-4 shrink-0" strokeWidth={1.75} aria-hidden="true" />
            <span>{tab.label}</span>
          </button>
        );
      })}
    </div>
  );
}
