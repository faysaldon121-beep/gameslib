'use client'; import { PortableText } from '@portabletext/react';
export default function PortableTextContent({ content }: { content: any }) { return <div className="prose prose-lg prose-invert max-w-none"><PortableText value={content} /></div>; }
