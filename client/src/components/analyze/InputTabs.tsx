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

  return (
    <div className="flex border-b border-slate-200 mb-6" role="tablist">
      {tabs.map((tab) => {
        const IconComponent = tab.icon;
        const isActive = activeTab === tab.id;
        return (
          <button
            key={tab.id}
            role="tab"
            aria-selected={isActive}
            onClick={() => onTabChange(tab.id)}
            className={`flex items-center gap-2 py-3 px-4 sm:px-6 text-sm font-semibold border-b-2 transition-colors ${
              isActive
                ? "border-brand-600 text-brand-600 bg-brand-50/50"
                : "border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300"
            }`}
          >
            <IconComponent className="w-4 h-4" />
            <span>{tab.label}</span>
          </button>
        );
      })}
    </div>
  );
}
