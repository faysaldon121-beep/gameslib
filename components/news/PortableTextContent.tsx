'use client';

import { PortableText, PortableTextComponents } from '@portabletext/react';
import Image from 'next/image';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism';

const components: PortableTextComponents = {
  types: {
    image: ({ value }) => {
      if (!value?.url) return null;
      
      return (
        <figure className="my-8">
          <div className="relative w-full aspect-video rounded-xl overflow-hidden">
            <Image
              src={value.url}
              alt={value.alt || 'Article image'}
              fill
              className="object-cover"
              sizes="(max-width: 768px) 100vw, 800px"
            />
          </div>
          {value.caption && (
            <figcaption className="text-center text-sm text-gray-400 mt-3 italic">
              {value.caption}
            </figcaption>
          )}
        </figure>
      );
    },
    code: ({ value }) => {
      return (
        <div className="my-6 rounded-xl overflow-hidden">
          {value.filename && (
            <div className="bg-gray-800 px-4 py-2 text-sm text-gray-400 border-b border-gray-700">
              {value.filename}
            </div>
          )}
          <SyntaxHighlighter
            language={value.language || 'javascript'}
            style={vscDarkPlus}
            customStyle={{
              margin: 0,
              borderRadius: value.filename ? '0 0 12px 12px' : '12px',
              padding: '1.5rem',
              fontSize: '0.9rem',
            }}
            showLineNumbers
          >
            {value.code}
          </SyntaxHighlighter>
        </div>
      );
    },
  },
  block: {
    h2: ({ children }) => (
      <h2 className="text-3xl font-black text-white mt-12 mb-4 scroll-mt-24" id={children?.toString().toLowerCase().replace(/\s+/g, '-')}>
        {children}
      </h2>
    ),
    h3: ({ children }) => (
      <h3 className="text-2xl font-bold text-white mt-8 mb-3 scroll-mt-24" id={children?.toString().toLowerCase().replace(/\s+/g, '-')}>
        {children}
      </h3>
    ),
    h4: ({ children }) => (
      <h4 className="text-xl font-bold text-white mt-6 mb-2 scroll-mt-24">
        {children}
      </h4>
    ),
    normal: ({ children }) => (
      <p className="text-gray-300 leading-relaxed mb-6 text-lg">
        {children}
      </p>
    ),
    blockquote: ({ children }) => (
      <blockquote className="border-l-4 border-purple-500 pl-6 py-2 my-6 bg-purple-900/10 italic text-gray-300">
        {children}
      </blockquote>
    ),
  },
  marks: {
    link: ({ value, children }) => {
      const target = value?.blank ? '_blank' : undefined;
      return (
        <a
          href={value?.href}
          target={target}
          rel={target === '_blank' ? 'noopener noreferrer' : undefined}
          className="text-purple-400 hover:text-purple-300 underline decoration-purple-400/50 hover:decoration-purple-300 transition-colors"
        >
          {children}
        </a>
      );
    },
    strong: ({ children }) => (
      <strong className="font-bold text-white">{children}</strong>
    ),
    em: ({ children }) => (
      <em className="italic text-gray-200">{children}</em>
    ),
    code: ({ children }) => (
      <code className="bg-purple-900/30 text-purple-300 px-2 py-1 rounded text-sm font-mono">
        {children}
      </code>
    ),
    underline: ({ children }) => (
      <span className="underline">{children}</span>
    ),
    'strike-through': ({ children }) => (
      <span className="line-through text-gray-500">{children}</span>
    ),
  },
  list: {
    bullet: ({ children }) => (
      <ul className="list-disc pl-6 space-y-2 mb-6 text-gray-300 text-lg marker:text-purple-400">
        {children}
      </ul>
    ),
    number: ({ children }) => (
      <ol className="list-decimal pl-6 space-y-2 mb-6 text-gray-300 text-lg marker:text-purple-400 marker:font-bold">
        {children}
      </ol>
    ),
  },
};

interface PortableTextContentProps {
  content: any;
}

export default function PortableTextContent({ content }: PortableTextContentProps) {
  return (
    <div className="prose prose-lg prose-invert max-w-none">
      <PortableText value={content} components={components} />
    </div>
  );
}
