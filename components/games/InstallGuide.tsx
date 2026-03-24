import { Download, FolderArchive, PlayCircle } from "lucide-react";

const icons = [Download, FolderArchive, PlayCircle];

export default function InstallGuide({ steps, title }: { steps: string[]; title: string }) {
  return (
    <section className="card p-6">
      <h2 className="text-xl font-bold text-g-text mb-4">How to install {title}</h2>
      <div className="space-y-4">
        {steps.map((step, index) => {
          const Icon = icons[index] || PlayCircle;
          return (
            <div key={step + index} className="flex items-start gap-4">
              <div className="h-10 w-10 shrink-0 rounded-full bg-g-purple/15 text-g-purple flex items-center justify-center font-bold">
                <Icon size={18} />
              </div>
              <div>
                <div className="font-semibold text-g-text">Step {index + 1}</div>
                <p className="text-g-muted text-sm mt-1">{step}</p>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
