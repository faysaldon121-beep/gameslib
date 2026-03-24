import { DownloadCloud, ShieldCheck } from "lucide-react";

export default function DownloadBox({ game }: { game: any }) {
  return (
    <div className="card p-5 space-y-4">
      <div>
        <h3 className="text-lg font-bold text-g-text">Download {game.title}</h3>
        <p className="text-sm text-g-muted mt-1">Direct links, mirrors, and size breakdown.</p>
      </div>
      <div className="space-y-3">
        {(game.downloadLinks || []).length > 0 ? game.downloadLinks.map((link: any, index: number) => (
          <a key={link.url + index} href={link.url} target="_blank" rel="noreferrer" className="flex items-center justify-between rounded-xl border border-g-border bg-g-bg/40 px-4 py-3 hover:border-g-purple">
            <div>
              <div className="font-medium text-g-text">{link.label}</div>
              <div className="text-xs text-g-muted">{link.host || "Direct"} {link.size ? `· ${link.size}` : ""}</div>
            </div>
            <DownloadCloud size={18} className="text-g-purple" />
          </a>
        )) : <p className="text-sm text-g-muted">Download links will be added soon.</p>}
      </div>
      <div className="rounded-xl border border-g-green/20 bg-g-green/10 px-4 py-3 text-sm text-g-text flex gap-3">
        <ShieldCheck className="text-g-green shrink-0 mt-0.5" size={18} />
        <p>Always scan downloaded files and verify the installation instructions before running an installer.</p>
      </div>
    </div>
  );
}
