// app/(admin)/admin/blog/editor/page.tsx
import { Suspense } from 'react';
import BlogEditorContent from './BlogEditorContent';

export default function BlogEditorPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gray-900 text-white flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-500"></div>
      </div>
    }>
      <BlogEditorContent />
    </Suspense>
  );
}
