import { cn } from "@/lib/utils";

const styles = {
  genre: "bg-g-blue/15 text-g-blueLight border-g-blue/20",
  featured: "bg-g-purple/15 text-g-purpleLight border-g-purple/20",
  version: "bg-g-border text-g-text border-g-border",
  success: "bg-g-green/15 text-g-green border-g-green/20",
  warning: "bg-g-gold/15 text-g-gold border-g-gold/20",
};

export default function Badge({ children, variant = "genre" }: { children: React.ReactNode; variant?: keyof typeof styles }) {
  return (
    <span className={cn("inline-flex items-center rounded-full border px-3 py-1 text-xs font-semibold", styles[variant])}>
      {children}
    </span>
  );
}
