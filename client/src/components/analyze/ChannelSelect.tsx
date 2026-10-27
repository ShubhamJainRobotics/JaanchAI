import { Channel } from "shared";

interface ChannelSelectProps {
  value: Channel;
  onChange: (channel: Channel) => void;
}

export function ChannelSelect({ value, onChange }: ChannelSelectProps) {
  const channels: { id: Channel; label: string }[] = [
    { id: "whatsapp", label: "WhatsApp" },
    { id: "telegram", label: "Telegram" },
    { id: "email", label: "Email" },
    { id: "sms", label: "SMS" },
    { id: "linkedin", label: "LinkedIn" },
    { id: "instagram", label: "Instagram" },
    { id: "website", label: "Job Board / Website" },
    { id: "phone_call", label: "Phone Call" },
    { id: "other", label: "Other" },
  ];

  return (
    <div className="space-y-1.5">
      <label htmlFor="channel-select" className="text-xs font-bold uppercase tracking-wider text-slate-700 block">
        How did it reach you?
      </label>
      <select
        id="channel-select"
        value={value}
        onChange={(e) => onChange(e.target.value as Channel)}
        className="w-full p-2.5 bg-white border border-slate-300 rounded-xl text-sm text-slate-800 font-medium focus:ring-2 focus:ring-brand-500 focus:outline-none"
      >
        {channels.map((c) => (
          <option key={c.id} value={c.id}>
            {c.label}
          </option>
        ))}
      </select>
    </div>
  );
}
