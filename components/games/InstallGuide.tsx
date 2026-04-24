import { FaCheckCircle } from "react-icons/fa";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

interface Props {
  steps: string[];
  title: string;
}

export default function InstallGuide({ steps, title }: Props) {
  return (
    <section className="bg-gray-900/50 rounded-2xl p-6 border border-gray-800">
      <h2 className="text-2xl font-bold text-white mb-6">
        How to Install {title}
      </h2>

      <div className="space-y-4">
        {steps.map((step, index) => (
          <div key={index} className="flex items-start gap-4 group">
            <div className="flex-shrink-0 w-8 h-8 rounded-full bg-gradient-to-br from-purple-600 to-cyan-600 flex items-center justify-center font-bold text-white text-sm">
              {index + 1}
            </div>
            <div className="flex-1 pt-1 prose prose-invert max-w-none prose-p:mt-0 prose-p:mb-0 prose-ul:mt-1 prose-ul:mb-0 prose-li:mt-0 prose-code:text-cyan-300 prose-code:bg-gray-800 prose-code:px-1 prose-code:rounded">
              <ReactMarkdown remarkPlugins={[remarkGfm]}>
                {step}
              </ReactMarkdown>
            </div>
            <FaCheckCircle className="text-green-500 mt-1 opacity-0 group-hover:opacity-100 transition-opacity" />
          </div>
        ))}
      </div>
    </section>
  );
}
