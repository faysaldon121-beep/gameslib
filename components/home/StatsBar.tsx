import { Download, Gamepad2, MessageSquare, Trophy } from "lucide-react";

const stats = [
  { icon: Gamepad2, label: "Games indexed", valueKey: "totalGames" },
  { icon: MessageSquare, label: "UGC reviews", staticValue: "Fresh daily" },
  { icon: Download, label: "Guides", staticValue: "Install + system reqs" },
  { icon: Trophy, label: "SERP lift", staticValue: "Rich snippets ready" },
];

export default function StatsBar({ totalGames }: { totalGames: number }) {
  return (
    <section className="border-b border-g-border bg-g-card/30">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 grid grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((item) => {
          const Icon = item.icon;
          return (
            <div key={item.label} className="card p-4 flex items-center gap-3">
              <div className="h-11 w-11 rounded-full bg-g-purple/15 flex items-center justify-center text-g-purple">
                <Icon size={20} />
              </div>
              <div>
                <div className="font-bold text-g-text">{item.valueKey ? totalGames : item.staticValue}</div>
                <div className="text-xs text-g-muted">{item.label}</div>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
