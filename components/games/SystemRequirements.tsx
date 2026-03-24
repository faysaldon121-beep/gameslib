export default function SystemRequirements({ requirements, title }: { requirements?: any; title: string }) {
  const minimum = requirements?.minimum || {};
  const recommended = requirements?.recommended || {};
  const rows = ["os", "cpu", "ram", "gpu", "storage", "directx"];
  return (
    <section className="card p-6 overflow-hidden">
      <h2 className="text-xl font-bold text-g-text mb-4">System requirements for {title}</h2>
      <div className="grid md:grid-cols-2 gap-5">
        {[{ label: "Minimum", values: minimum }, { label: "Recommended", values: recommended }].map((group) => (
          <div key={group.label} className="rounded-xl border border-g-border p-4 bg-g-bg/40">
            <h3 className="font-semibold text-g-text mb-3">{group.label}</h3>
            <dl className="space-y-2 text-sm">
              {rows.map((key) => (
                <div key={key} className="flex justify-between gap-3">
                  <dt className="capitalize text-g-muted">{key}</dt>
                  <dd className="text-g-text text-right max-w-[65%]">{group.values[key] || "N/A"}</dd>
                </div>
              ))}
            </dl>
          </div>
        ))}
      </div>
    </section>
  );
}
