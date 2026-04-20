import { FaWindows, FaMicrochip, FaMemory, FaDesktop, FaHdd, FaCog } from "react-icons/fa";

interface Requirements {
  minimum?: {
    os?: string;
    cpu?: string;
    ram?: string;
    gpu?: string;
    storage?: string;
    directx?: string;
  };
  recommended?: {
    os?: string;
    cpu?: string;
    ram?: string;
    gpu?: string;
    storage?: string;
    directx?: string;
  };
}

interface Props {
  requirements?: Requirements;
  title: string;
}

export default function SystemRequirements({ requirements, title }: Props) {
  const icons = {
    os: FaWindows,
    cpu: FaMicrochip,
    ram: FaMemory,
    gpu: FaDesktop,
    storage: FaHdd,
    directx: FaCog,
  };

  const labels = {
    os: "Operating System",
    cpu: "Processor",
    ram: "Memory",
    gpu: "Graphics",
    storage: "Storage",
    directx: "DirectX",
  };

  return (
    <section className="bg-gray-900/50 rounded-2xl p-6 border border-gray-800">
      <h2 className="text-2xl font-bold text-white mb-6">
        System Requirements for {title}
      </h2>

      <div className="grid md:grid-cols-2 gap-6">
        {/* Minimum */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-purple-400 border-b border-gray-800 pb-2">
            Minimum
          </h3>
          {Object.entries(requirements?.minimum || {}).map(([key, value]) => {
            const Icon = icons[key as keyof typeof icons];
            return (
              <div key={key} className="flex items-start gap-3">
                <Icon className="text-purple-400 mt-1 flex-shrink-0" />
                <div>
                  <div className="text-sm text-gray-400">{labels[key as keyof typeof labels]}</div>
                  <div className="text-white font-medium">{value || "N/A"}</div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Recommended */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-cyan-400 border-b border-gray-800 pb-2">
            Recommended
          </h3>
          {Object.entries(requirements?.recommended || {}).map(([key, value]) => {
            const Icon = icons[key as keyof typeof icons];
            return (
              <div key={key} className="flex items-start gap-3">
                <Icon className="text-cyan-400 mt-1 flex-shrink-0" />
                <div>
                  <div className="text-sm text-gray-400">{labels[key as keyof typeof labels]}</div>
                  <div className="text-white font-medium">{value || "N/A"}</div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
